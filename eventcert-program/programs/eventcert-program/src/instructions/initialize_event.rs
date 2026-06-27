use anchor_lang::prelude::*;
use crate::{state::EventAccount, EventCertError};
use super::InitializeEvent;

pub fn handler(
    ctx: Context<InitializeEvent>,
    event_id: u64,
    name: String,
    start_time: i64,
    end_time: i64,
    max_attendees: u32,
) -> Result<()> {
    require!(name.as_bytes().len() <= EventAccount::NAME_MAX, EventCertError::Overflow);
    require!(start_time < end_time, EventCertError::EventNotStarted);

    let event_account = &mut ctx.accounts.event_account;
    event_account.organizer = ctx.accounts.organizer.key();
    event_account.event_id = event_id;
    event_account.name = name;
    event_account.start_time = start_time;
    event_account.end_time = end_time;
    event_account.max_attendees = max_attendees;
    event_account.checked_in_count = 0;
    event_account.bump = ctx.bumps.event_account;
    Ok(())
}
