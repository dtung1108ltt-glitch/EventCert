use anchor_lang::prelude::*;
use crate::{BadgeMinted, EventCertError};
use super::MintBadge;

pub fn handler(ctx: Context<MintBadge>, metadata_uri: String) -> Result<()> {
    require!(
        metadata_uri.as_bytes().len() <= crate::state::BadgeMint::URI_MAX,
        EventCertError::Overflow
    );

    let badge_mint_account = &mut ctx.accounts.badge_mint_account;
    badge_mint_account.mint = Pubkey::default();
    badge_mint_account.event = ctx.accounts.event_account.key();
    badge_mint_account.metadata_uri = metadata_uri;
    badge_mint_account.minted_at = Clock::get()?.unix_timestamp;

    ctx.accounts.attendee_record.badge_mint = badge_mint_account.mint;

    emit!(BadgeMinted {
        event: ctx.accounts.event_account.key(),
        attendee: ctx.accounts.attendee.key(),
        badge_mint: badge_mint_account.mint,
    });

    Ok(())
}
