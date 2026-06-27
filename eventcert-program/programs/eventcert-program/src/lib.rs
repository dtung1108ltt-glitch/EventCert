use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;

pub use instructions::*;

declare_id!("8AVFzXLHah4DugdA4KDSpEUGnedd6gm7yz9B7XvSFDej");

#[program]
pub mod eventcert_program {
    use super::*;

    pub fn initialize_event(
        ctx: Context<InitializeEvent>,
        event_id: u64,
        name: String,
        start_time: i64,
        end_time: i64,
        max_attendees: u32,
    ) -> Result<()> {
        instructions::initialize_event::handler(ctx, event_id, name, start_time, end_time, max_attendees)
    }

    pub fn create_qr_session(ctx: Context<CreateQrSession>) -> Result<()> {
        instructions::create_qr_session::handler(ctx)
    }

    pub fn check_in_attendee(ctx: Context<CheckInAttendee>) -> Result<()> {
        instructions::check_in_attendee::handler(ctx)
    }

    pub fn mint_badge(ctx: Context<MintBadge>, metadata_uri: String) -> Result<()> {
        instructions::mint_badge::handler(ctx, metadata_uri)
    }

    pub fn award_points(ctx: Context<AwardPoints>, amount: u64) -> Result<()> {
        instructions::award_points::handler(ctx, amount)
    }

    pub fn redeem_points(ctx: Context<RedeemPoints>, amount: u64) -> Result<()> {
        instructions::redeem_points::handler(ctx, amount)
    }
}

// Events
#[event]
pub struct CheckInEvent {
    pub event: Pubkey,
    pub attendee: Pubkey,
}

#[event]
pub struct BadgeMinted {
    pub event: Pubkey,
    pub attendee: Pubkey,
    pub badge_mint: Pubkey,
}

#[event]
pub struct PointsAwarded {
    pub event: Pubkey,
    pub attendee: Pubkey,
    pub amount: u64,
    pub total_points: u64,
}

#[event]
pub struct PointsRedeemed {
    pub event: Pubkey,
    pub attendee: Pubkey,
    pub amount: u64,
    pub redeemed_points: u64,
}

// Errors
#[error_code]
pub enum EventCertError {
    #[msg("Event not started")]
    EventNotStarted,
    #[msg("Event ended")]
    EventEnded,
    #[msg("Event full")]
    EventFull,
    #[msg("Insufficient points")]
    InsufficientPoints,
    #[msg("Overflow")]
    Overflow,
}

