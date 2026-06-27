use anchor_lang::prelude::*;

use crate::{EventCertError, PointsRedeemed};

use super::RedeemPoints;

pub fn handler(ctx: Context<RedeemPoints>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.loyalty_vault;

    require!(vault.total_points >= amount, EventCertError::InsufficientPoints);

    vault.total_points = vault.total_points.checked_sub(amount).ok_or(EventCertError::Overflow)?;
    vault.redeemed_points = vault
        .redeemed_points
        .checked_add(amount)
        .ok_or(EventCertError::Overflow)?;

    vault.last_updated = Clock::get()?.unix_timestamp;

    emit!(PointsRedeemed {
        event: ctx.accounts.event_account.key(),
        attendee: ctx.accounts.attendee.key(),
        amount,
        redeemed_points: vault.redeemed_points,
    });

    Ok(())
}

