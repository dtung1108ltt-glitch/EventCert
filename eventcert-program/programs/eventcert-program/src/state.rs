use anchor_lang::prelude::*;

#[account]
pub struct EventAccount {
    pub organizer: Pubkey,
    pub event_id: u64,
    pub name: String, // max 64
    pub start_time: i64,
    pub end_time: i64,
    pub max_attendees: u32,
    pub checked_in_count: u32,
    pub bump: u8,
}

impl EventAccount {
    pub const NAME_MAX: usize = 64;

    pub const LEN: usize = 8  // discriminator
        + 32                 // organizer
        + 8                  // event_id
        + 4 + Self::NAME_MAX // name (string prefix + bytes)
        + 8                  // start_time
        + 8                  // end_time
        + 4                  // max_attendees
        + 4                  // checked_in_count
        + 1;                 // bump
}

#[account]
pub struct AttendeeRecord {
    pub event: Pubkey,
    pub attendee: Pubkey,
    pub checked_in_at: i64,
    pub badge_mint: Pubkey,
    pub points_awarded: u32,
    pub bump: u8,
}

impl AttendeeRecord {
    pub const LEN: usize = 8  // discriminator
        + 32                 // event
        + 32                 // attendee
        + 8                  // checked_in_at
        + 32                 // badge_mint
        + 4                  // points_awarded
        + 1;                 // bump
}

#[account]
pub struct LoyaltyVault {
    pub owner: Pubkey,
    pub total_points: u64,
    pub redeemed_points: u64,
    pub last_updated: i64,
    pub bump: u8,
}

impl LoyaltyVault {
    pub const LEN: usize = 8  // discriminator
        + 32                 // owner
        + 8                  // total_points
        + 8                  // redeemed_points
        + 8                  // last_updated
        + 1;                 // bump
}

#[account]
pub struct BadgeMint {
    pub mint: Pubkey,
    pub event: Pubkey,
    pub metadata_uri: String, // max 200
    pub minted_at: i64,
}

impl BadgeMint {
    pub const URI_MAX: usize = 200;

    pub const LEN: usize = 8 // discriminator
        + 32                 // mint
        + 32                 // event
        + 4 + Self::URI_MAX // metadata_uri
        + 8;                 // minted_at
}

