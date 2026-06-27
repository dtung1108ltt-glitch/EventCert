# EventCert - TODO (Phase 1: Solana Program)

## 0. Repo bootstrap
- [ ] Create Anchor workspace structure under `eventcert-program/`
- [ ] Ensure Anchor/Rust versions: Rust 1.75, Anchor 0.29

## 1. Program scaffolding
- [ ] Create/update `Anchor.toml`, `Cargo.toml`, `programs/eventcert-program/src/lib.rs`
- [ ] Add module structure for `state.rs` and instructions

## 2. Accounts / state
- [ ] Implement `state.rs` with: `EventAccount`, `AttendeeRecord`, `LoyaltyVault`, `BadgeMint`
- [ ] Implement PDA seeds + `LEN` calculations + bumps

## 3. Instructions + events + errors
- [ ] Implement `initialize_event`
- [ ] Implement `create_qr_session` (emit event with session data)
- [ ] Implement `check_in_attendee`
- [ ] Implement `mint_badge` (Metaplex Token Metadata CPI)
- [ ] Implement `award_points`
- [ ] Implement `redeem_points`
- [ ] Implement `#[event]` structs + `#[error_code]` codes

## 4. TypeScript tests (Anchor Test Framework)
- [ ] Create 7 test cases per spec/table mapping
- [ ] Run `anchor test` on local validator

## 5. Validate
- [ ] Fix compilation/lint issues
- [ ] Ensure all tests pass

