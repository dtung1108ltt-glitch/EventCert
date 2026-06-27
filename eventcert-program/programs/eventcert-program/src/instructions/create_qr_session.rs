use anchor_lang::prelude::*;

use super::CreateQrSession;

pub fn handler(_ctx: Context<CreateQrSession>) -> Result<()> {
    // Spec: emit event with session data.
    // For Phase 1 we keep it as a no-op (will be expanded in Phase 2/3).
    Ok(())
}

