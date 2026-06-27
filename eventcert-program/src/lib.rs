use anchor_lang::prelude::*;

declare_id!("EioDsXWiQR9DTxnk9U9jRF78hWYDp9HBBV23tvRXnYtK");

#[program]
pub mod eventcert_program {
    use super::*;

    pub fn initialize_event(
        ctx: Context<InitializeEvent>,
        event_id: String,
        name: String,
        description: String,
        start_time: i64,
        end_time: i64,
        max_attendees: u32,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event_account;
        event.organizer = ctx.accounts.organizer.key();
        event.event_id = event_id;
        event.name = name;
        event.description = description;
        event.start_time = start_time;
        event.end_time = end_time;
        event.max_attendees = max_attendees;
        event.attendee_count = 0;
        event.is_active = true;
        event.session_nonce = String::new();
        Ok(())
    }

    pub fn create_qr_session(
        ctx: Context<CreateQrSession>,
        session_nonce: String,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event_account;
        require!(event.is_active, EventCertError::EventNotActive);
        event.session_nonce = session_nonce;
        Ok(())
    }

    pub fn check_in_attendee(
        ctx: Context<CheckInAttendee>,
        session_nonce: String,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event_account;
        let clock = Clock::get()?;

        require!(event.is_active, EventCertError::EventNotActive);
        require!(clock.unix_timestamp >= event.start_time, EventCertError::EventNotStarted);
        require!(clock.unix_timestamp <= event.end_time, EventCertError::EventEnded);
        require!(event.attendee_count < event.max_attendees, EventCertError::EventFull);
        require!(event.session_nonce == session_nonce, EventCertError::InvalidSession);

        let record = &mut ctx.accounts.attendee_record;
        record.event = event.key();
        record.attendee = ctx.accounts.attendee.key();
        record.checked_in_at = clock.unix_timestamp;
        record.points_earned = 0;
        record.badge_minted = false;

        let vault = &mut ctx.accounts.loyalty_vault;
        if vault.attendee == Pubkey::default() {
            vault.attendee = ctx.accounts.attendee.key();
            vault.total_points = 0;
        }

        event.attendee_count += 1;
        Ok(())
    }

    pub fn mint_badge(
        ctx: Context<MintBadge>,
        metadata_uri: String,
    ) -> Result<()> {
        let record = &mut ctx.accounts.attendee_record;
        require!(!record.badge_minted, EventCertError::BadgeAlreadyMinted);

        let badge = &mut ctx.accounts.badge_mint;
        badge.attendee_record = record.key();
        badge.metadata_uri = metadata_uri;
        badge.minted_at = Clock::get()?.unix_timestamp;

        record.badge_minted = true;
        Ok(())
    }

    pub fn award_points(
        ctx: Context<AwardPoints>,
        points: u64,
    ) -> Result<()> {
        let record = &mut ctx.accounts.attendee_record;
        let vault = &mut ctx.accounts.loyalty_vault;

        record.points_earned += points;
        vault.total_points += points;
        Ok(())
    }

    pub fn redeem_points(
        ctx: Context<RedeemPoints>,
        points: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.loyalty_vault;
        require!(vault.total_points >= points, EventCertError::InsufficientPoints);
        vault.total_points -= points;
        Ok(())
    }
}

// ============ Accounts ============

#[account]
pub struct EventAccount {
    pub organizer: Pubkey,
    pub event_id: String,
    pub name: String,
    pub description: String,
    pub start_time: i64,
    pub end_time: i64,
    pub max_attendees: u32,
    pub attendee_count: u32,
    pub is_active: bool,
    pub session_nonce: String,
}

#[account]
pub struct AttendeeRecord {
    pub event: Pubkey,
    pub attendee: Pubkey,
    pub checked_in_at: i64,
    pub points_earned: u64,
    pub badge_minted: bool,
}

#[account]
pub struct LoyaltyVault {
    pub attendee: Pubkey,
    pub total_points: u64,
}

#[account]
pub struct BadgeMint {
    pub attendee_record: Pubkey,
    pub metadata_uri: String,
    pub minted_at: i64,
}

// ============ Contexts ============

#[derive(Accounts)]
#[instruction(event_id: String)]
pub struct InitializeEvent<'info> {
    #[account(
        init,
        payer = organizer,
        space = 8 + 32 + 64 + 100 + 256 + 8 + 8 + 4 + 4 + 1 + 64,
        seeds = [b"event", organizer.key().as_ref(), event_id.as_bytes()],
        bump
    )]
    pub event_account: Account<'info, EventAccount>,
    #[account(mut)]
    pub organizer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateQrSession<'info> {
    #[account(mut, has_one = organizer)]
    pub event_account: Account<'info, EventAccount>,
    pub organizer: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckInAttendee<'info> {
    #[account(mut)]
    pub event_account: Account<'info, EventAccount>,
    #[account(
        init,
        payer = attendee,
        space = 8 + 32 + 32 + 8 + 8 + 1,
        seeds = [b"attendee", event_account.key().as_ref(), attendee.key().as_ref()],
        bump
    )]
    pub attendee_record: Account<'info, AttendeeRecord>,
    #[account(
        init_if_needed,
        payer = attendee,
        space = 8 + 32 + 8,
        seeds = [b"vault", attendee.key().as_ref()],
        bump
    )]
    pub loyalty_vault: Account<'info, LoyaltyVault>,
    #[account(mut)]
    pub attendee: Signer<'info>,
    pub organizer: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintBadge<'info> {
    pub event_account: Account<'info, EventAccount>,
    #[account(mut, has_one = attendee)]
    pub attendee_record: Account<'info, AttendeeRecord>,
    #[account(
        init,
        payer = organizer,
        space = 8 + 32 + 200 + 8,
        seeds = [b"badge_mint", attendee_record.key().as_ref()],
        bump
    )]
    pub badge_mint: Account<'info, BadgeMint>,
    pub attendee: SystemAccount<'info>,
    #[account(mut)]
    pub organizer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AwardPoints<'info> {
    pub event_account: Account<'info, EventAccount>,
    #[account(mut)]
    pub attendee_record: Account<'info, AttendeeRecord>,
    #[account(mut)]
    pub loyalty_vault: Account<'info, LoyaltyVault>,
    pub organizer: Signer<'info>,
}

#[derive(Accounts)]
pub struct RedeemPoints<'info> {
    #[account(mut, has_one = attendee)]
    pub loyalty_vault: Account<'info, LoyaltyVault>,
    pub attendee: Signer<'info>,
}

// ============ Errors ============

#[error_code]
pub enum EventCertError {
    #[msg("Event is not active")]
    EventNotActive,
    #[msg("Event has not started yet")]
    EventNotStarted,
    #[msg("Event has already ended")]
    EventEnded,
    #[msg("Event is full")]
    EventFull,
    #[msg("Invalid QR session")]
    InvalidSession,
    #[msg("Badge already minted")]
    BadgeAlreadyMinted,
    #[msg("Insufficient points")]
    InsufficientPoints,
}
