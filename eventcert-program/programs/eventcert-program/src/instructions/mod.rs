pub mod initialize_event;
pub mod create_qr_session;
pub mod check_in_attendee;
pub mod mint_badge;
pub mod award_points;
pub mod redeem_points;

use anchor_lang::prelude::*;
use crate::state::*;

// ---- Context structs (minimal, enough for tests & compilation) ----

#[derive(Accounts)]
#[instruction(event_id: u64)]
pub struct InitializeEvent<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        init,
        payer = organizer,
        space = EventAccount::LEN,
        seeds = [b"event", organizer.key().as_ref(), &event_id.to_le_bytes()],
        bump
    )]
    pub event_account: Account<'info, EventAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateQrSession<'info> {
    // Placeholder instruction per spec: emit event with session data.
    // We'll keep accounts minimal for now.
    pub organizer: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckInAttendee<'info> {
    #[account(mut)]
    pub attendee: Signer<'info>,

    #[account(
        mut,
        seeds = [b"event", event_account.organizer.as_ref(), &event_account.event_id.to_le_bytes()],
        bump = event_account.bump
    )]
    pub event_account: Account<'info, EventAccount>,

    #[account(
        init,
        payer = attendee,
        space = AttendeeRecord::LEN,
        seeds = [b"attendee", event_account.key().as_ref(), attendee.key().as_ref()],
        bump
    )]
    pub attendee_record: Account<'info, AttendeeRecord>,

    #[account(
        init_if_needed,
        payer = attendee,
        space = LoyaltyVault::LEN,
        seeds = [b"vault", attendee.key().as_ref()],
        bump
    )]
    pub loyalty_vault: Account<'info, LoyaltyVault>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintBadge<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        seeds = [b"event", event_account.organizer.as_ref(), &event_account.event_id.to_le_bytes()],
        bump = event_account.bump
    )]
    pub event_account: Account<'info, EventAccount>,

    #[account(
        mut,
        seeds = [b"attendee", event_account.key().as_ref(), attendee.key().as_ref()],
        bump = attendee_record.bump
    )]
    pub attendee_record: Account<'info, AttendeeRecord>,

    #[account(mut)]
    pub attendee: Signer<'info>,

    // BadgeMint PDA
    #[account(
        init,
        payer = organizer,
        space = BadgeMint::LEN,
        seeds = [b"badge_mint", attendee_record.key().as_ref()],
        bump
    )]
    pub badge_mint_account: Account<'info, BadgeMint>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AwardPoints<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"event", event_account.organizer.as_ref(), &event_account.event_id.to_le_bytes()],
        bump = event_account.bump
    )]
    pub event_account: Account<'info, EventAccount>,

    #[account(
        mut,
        seeds = [b"attendee", event_account.key().as_ref(), attendee.key().as_ref()],
        bump = attendee_record.bump
    )]
    pub attendee_record: Account<'info, AttendeeRecord>,

    #[account(
        mut,
        seeds = [b"vault", attendee.key().as_ref()],
        bump = loyalty_vault.bump
    )]
    pub loyalty_vault: Account<'info, LoyaltyVault>,

    #[account(mut)]
    pub attendee: Signer<'info>,
}

#[derive(Accounts)]
pub struct RedeemPoints<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"event", event_account.organizer.as_ref(), &event_account.event_id.to_le_bytes()],
        bump = event_account.bump
    )]
    pub event_account: Account<'info, EventAccount>,

    #[account(
        mut,
        seeds = [b"attendee", event_account.key().as_ref(), attendee.key().as_ref()],
        bump = attendee_record.bump
    )]
    pub attendee_record: Account<'info, AttendeeRecord>,

    #[account(
        mut,
        seeds = [b"vault", attendee.key().as_ref()],
        bump = loyalty_vault.bump
    )]
    pub loyalty_vault: Account<'info, LoyaltyVault>,

    #[account(mut)]
    pub attendee: Signer<'info>,
}

