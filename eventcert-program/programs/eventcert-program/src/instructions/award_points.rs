use anchor_lang::prelude::*;

use crate::{EventCertError, PointsAwarded};

use super::AwardPoints;

pub fn handler(ctx: Context<AwardPoints>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.loyalty_vault;
    let attendee_record = &mut ctx.accounts.attendee_record;

    let new_total = vault
        .total_points
        .checked_add(amount)
        .ok_or(EventCertError::Overflow)?;

    vault.total_points = new_total;
    vault.last_updated = Clock::get()?.unix_timestamp;

    // spec says AttendeeRecord.points_awarded is u32.
    attendee_record.points_awarded = attendee_record
        .points_awarded
        .checked_add(amount as u32)
        .ok_or(EventCertError::Overflow)?;

    emit!(PointsAwarded {
        event: ctx.accounts.event_account.key(),
        attendee: ctx.accounts.attendee.key(),
        amount,
        total_points: vault.total_points,
    });

    Ok(())
}

