#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("8D6DNFXjHFDG2Lgaw84uh111YxtYpJ3yaJJehRpbjt83");

#[constant]
const GLOBAL_CONFIG_SEED: &[u8] = b"global-config";

#[constant]
const PAYMENT_SEED: &[u8] = b"payment-type";

#[program]
pub mod payment_processor {
    use super::*;

    /// One-time program initialization by the admin.
    pub fn initialize(ctx: Context<Initialize>, new_admin: Pubkey) -> Result<()> {
        let cfg = &mut ctx.accounts.global_config;
        // Authorization constraint enforced declaratively on the admin account
        cfg.admin = new_admin;
        Ok(())
    }

    /// Register or update a payment_type that users can purchase.
    pub fn set_payment_type(
        ctx: Context<SetPaymentType>,
        payment_type_name: String,
        amount: Option<u64>,
        token: Pubkey,
    ) -> Result<()> {
        let payment_type = &mut ctx.accounts.payment_type;
        payment_type.name = payment_type_name.clone();
        payment_type.amount = amount;
        payment_type.token = token;

        emit!(PaymentTypeAdded {
            payment_type: payment_type_name,
            amount,
            token
        });
        Ok(())
    }

    /// Pay for a prompt (or any other registered payment_type).
    pub fn pay(
        ctx: Context<Pay>,
        payment_type: String,
        amount: u64,
        payment_id: [u8; 32],
    ) -> Result<()> {
        let op = &ctx.accounts.payment_type;

        // Enforce price match only when a price is configured
        if let Some(expected) = op.amount {
            require!(amount == expected, XyberError::PriceMismatch);
        }

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_ata.to_account_info(),
                to: ctx.accounts.agent_ata.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;

        emit!(PaymentPaid {
            name: payment_type.clone(),
            payment_mint: op.token,
            payment_id,
            amount,
            payer: ctx.accounts.payer.key(),
            agent_wallet: ctx.accounts.agent_wallet.key(),
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        mut,
        constraint = global_config.admin == Pubkey::default()
            || admin.key() == global_config.admin @ XyberError::Unauthorized
    )]
    pub admin: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [GLOBAL_CONFIG_SEED],
        bump,
        payer = admin,
        space = GlobalConfig::DISCRIMINATOR.len() + GlobalConfig::INIT_SPACE,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(payment_type_name: String, token: Pubkey)]
pub struct SetPaymentType<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_CONFIG_SEED],
        bump,
        has_one = admin @ XyberError::Unauthorized,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        init_if_needed,
        payer = admin,
        seeds = [PAYMENT_SEED, payment_type_name.as_bytes()],
        bump,
        space = 8 + PaymentType::INIT_SPACE,
    )]
    pub payment_type: Account<'info, PaymentType>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(payment_type_name: String)]
pub struct Pay<'info> {
    #[account(
        seeds = [GLOBAL_CONFIG_SEED],
        bump,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        seeds = [PAYMENT_SEED, payment_type_name.as_bytes()],
        bump,
    )]
    pub payment_type: Account<'info, PaymentType>,

    #[account(
        mut,
        token::mint = payment_type.token,
        token::authority = payer,
    )]
    pub payer_ata: Account<'info, TokenAccount>,

    /// CHECK: Wallet that will receive the payment
    pub agent_wallet: UncheckedAccount<'info>,

    #[account(
        mut,
        token::mint = payment_type.token,
        token::authority = agent_wallet,
        token::token_program = token_program,
        constraint = agent_ata.owner == agent_wallet.key() @ XyberError::WrongReceiver
)]
    pub agent_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub admin: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct PaymentType {
    #[max_len(32)]
    pub name: String,
    pub amount: Option<u64>,
    pub token: Pubkey,
}

#[event]
pub struct PaymentPaid {
    pub name: String,
    pub payment_mint: Pubkey,
    pub payment_id: [u8; 32],
    pub amount: u64,
    pub payer: Pubkey,
    pub agent_wallet: Pubkey,
}

#[event]
pub struct PaymentTypeAdded {
    pub payment_type: String,
    pub amount: Option<u64>,
    pub token: Pubkey,
}

#[error_code]
pub enum XyberError {
    #[msg("Unsupported payment token mint")]
    UnsupportedMint,
    #[msg("Receiver token authority does not match agent wallet")]
    WrongReceiver,
    #[msg("Provided price does not match payment amount")]
    PriceMismatch,
    #[msg("Caller is not authorized to modify the global config")]
    Unauthorized,
}
