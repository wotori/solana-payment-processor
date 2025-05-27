use anchor_lang::prelude::*;

declare_id!("GC7VZh7jh34RZpqpHrsQ39g1Umh1XyWXX1sGidR7fp3K");

#[program]
pub mod solana_finance {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
