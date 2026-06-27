use anchor_lang::prelude::*;

use crate::{state::AttendeeRecord, EventCertError, CheckInEvent};

use super::CheckInAttendee;

pub fn handler(ctx: Context<CheckInAttendee>) -> Result<()> {
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    let event = &mut ctx.accounts.event_account;

    if now < event.start_time {
        return Err(EventCertError::EventNotStarted.into());
    }
    if now > event.end_time {
        return Err(EventCertError::EventEnded.into());
    }
    if event.checked_in_count >= event.max_attendees {
        return Err(EventCertError::EventFull.into());
    }

    // If AttendeeRecord PDA already exists, Solana will reject the init (prevents duplicate check-in).
    let attendee_record: &mut AttendeeRecord = &mut ctx.accounts.attendee_record;
    attendee_record.event = event.key();
    attendee_record.attendee = ctx.accounts.attendee.key();
    attendee_record.checked_in_at = now;
    attendee_record.badge_mint = Pubkey::default();
    attendee_record.points_awarded = 0;
    attendee_record.bump = ctx.bumps.attendee_record;

    // Init loyalty vault if needed
    let vault = &mut ctx.accounts.loyalty_vault;
    if vault.owner == Pubkey::default() {
        vault.owner = ctx.accounts.attendee.key();
        vault.total_points = 0;
        vault.redeemed_points = 0;
        vault.last_updated = now;
        vault.bump = ctx.bumps.loyalty_vault;
    }

    event.checked_in_count = event.checked_in_count.checked_add(1).ok_or(EventCertError::Overflow)?;

    emit!(CheckInEvent {
        event: event.key(),
        attendee: attendee_record.attendee,
    });

    Ok(())
}

