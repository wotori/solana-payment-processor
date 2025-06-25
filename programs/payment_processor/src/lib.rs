#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("8D6DNFXjHFDG2Lgaw84uh111YxtYpJ3yaJJehRpbjt83");

#[program]
pub mod payment_processor {
    use super::*;

    /// One-time program initialization by the admin.
    pub fn initialize(ctx: Context<Initialize>, new_admin: Pubkey) -> Result<()> {
        let cfg = &mut ctx.accounts.global_config;
        // Allow re-initialization only by the current admin
        if cfg.admin != Pubkey::default() {
            require_keys_eq!(
                cfg.admin,
                ctx.accounts.admin.key(),
                XyberError::Unauthorized
            );
        }
        cfg.admin = new_admin;
        Ok(())
    }

    /// Register or update an operation that users can purchase.
    pub fn set_payment_type(
        ctx: Context<SetPaymentType>,
        payment_type: String,
        payment_amount: u64,
        payment_token: Pubkey,
    ) -> Result<()> {
        let operation = &mut ctx.accounts.operation;
        operation.payment_type = payment_type;
        operation.payment_amount = payment_amount;
        operation.payment_token = payment_token;

        emit!(OperationAdded { payment_amount });
        Ok(())
    }

    /// Pay for a prompt (or any other registered operation).
    pub fn pay(
        ctx: Context<Pay>,
        payment_type: String,
        amount: u64,
        payment_id: [u8; 32],
    ) -> Result<()> {
        let op = &ctx.accounts.operation;

        require_keys_eq!(
            ctx.accounts.payer_ata.mint,
            op.payment_token,
            XyberError::UnsupportedMint
        );
        require_keys_eq!(
            ctx.accounts.receiver_token.mint,
            op.payment_token,
            XyberError::UnsupportedMint
        );

        require!(amount == op.payment_amount, XyberError::PriceMismatch);
        require_keys_eq!(
            ctx.accounts.receiver_token.owner,
            ctx.accounts.agent_wallet.key(),
            XyberError::WrongReceiver
        );
        let amount = amount;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_ata.to_account_info(),
                to: ctx.accounts.receiver_token.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;

        emit!(OperationPaid {
            payment_type: payment_type.clone(),
            payment_mint: op.payment_token,
            payment_id,
            payment_amount: amount,
            payer: ctx.accounts.payer.key(),
            agent_wallet: ctx.accounts.agent_wallet.key(),
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init_if_needed,
        seeds = [b"global-config"],
        bump,
        payer = admin,
        space = 8 + GlobalConfig::INIT_SPACE,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(payment_type: String, payment_token: Pubkey)]
pub struct SetPaymentType<'info> {
    #[account(
        mut,
        seeds = [b"global-config"],
        bump,
        has_one = admin @ XyberError::Unauthorized,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        init_if_needed,
        payer = admin,
        seeds = [b"operation", payment_type.as_bytes()],
        bump,
        space = 8 + Operation::INIT_SPACE,
    )]
    pub operation: Account<'info, Operation>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(payment_type: String)]
pub struct Pay<'info> {
    #[account(
        seeds = [b"global-config"],
        bump,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
    seeds = [b"operation", payment_type.as_bytes().as_ref()],
    bump,
    )]
    pub operation: Account<'info, Operation>,

    #[account(
        mut,
        token::mint = operation.payment_token,
        token::authority = payer,
    )]
    pub payer_ata: Account<'info, TokenAccount>,

    /// CHECK: Wallet that will receive the payment
    pub agent_wallet: UncheckedAccount<'info>,

    #[account(
        mut,
        token::mint = operation.payment_token,
    )]
    pub receiver_token: Account<'info, TokenAccount>,

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
pub struct Operation {
    #[max_len(32)]
    pub payment_type: String,
    pub payment_amount: u64,
    pub payment_token: Pubkey,
}

#[event]
pub struct OperationPaid {
    pub payment_type: String,
    pub payment_mint: Pubkey,
    pub payment_id: [u8; 32],
    pub payment_amount: u64,
    pub payer: Pubkey,
    pub agent_wallet: Pubkey,
}

#[event]
pub struct OperationAdded {
    pub payment_amount: u64,
}

#[error_code]
pub enum XyberError {
    #[msg("Unsupported payment token mint")]
    UnsupportedMint,
    #[msg("Receiver token authority does not match agent wallet")]
    WrongReceiver,
    #[msg("Provided price does not match operation price")]
    PriceMismatch,
    #[msg("Caller is not authorized to modify the global config")]
    Unauthorized,
}
