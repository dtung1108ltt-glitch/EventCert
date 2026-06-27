import { PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getConnection, getOrganizerKeypair } from "./client";
import { getProgram, PROGRAM_ID } from "./program";
import * as anchor from "@coral-xyz/anchor";

// PDA helpers
export function getEventPDA(organizer: PublicKey, eventId: string) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("event"), organizer.toBuffer(), Buffer.from(eventId)],
    PROGRAM_ID
  );
}

export function getAttendeeRecordPDA(eventPDA: PublicKey, attendee: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("attendee"), eventPDA.toBuffer(), attendee.toBuffer()],
    PROGRAM_ID
  );
}

export function getLoyaltyVaultPDA(attendee: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), attendee.toBuffer()],
    PROGRAM_ID
  );
}

export function getBadgeMintPDA(attendeeRecordPDA: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("badge_mint"), attendeeRecordPDA.toBuffer()],
    PROGRAM_ID
  );
}
