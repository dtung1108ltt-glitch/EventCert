import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getProgram } from "../../solana/program";
import { getEventPDA, getAttendeeRecordPDA, getLoyaltyVaultPDA } from "../../solana/transactions";
import { getOrganizerKeypair } from "../../solana/client";

export async function awardPoints(
  eventId: string,
  organizerPubkey: string,
  attendeePubkey: string,
  points: number
) {
  const program = getProgram();
  const organizer = getOrganizerKeypair();

  const organizerKey = new PublicKey(organizerPubkey);
  const attendeeKey = new PublicKey(attendeePubkey);

  const [eventPDA] = getEventPDA(organizerKey, eventId);
  const [attendeeRecordPDA] = getAttendeeRecordPDA(eventPDA, attendeeKey);
  const [loyaltyVaultPDA] = getLoyaltyVaultPDA(attendeeKey);

  const tx = await program.methods
    .awardPoints(new BN(points))
    .accounts({
      eventAccount: eventPDA,
      attendeeRecord: attendeeRecordPDA,
      loyaltyVault: loyaltyVaultPDA,
      organizer: organizer.publicKey,
    })
    .signers([organizer])
    .rpc();

  return { tx, points };
}

export async function redeemPoints(attendeePubkey: string, points: number) {
  const program = getProgram();
  const organizer = getOrganizerKeypair();
  const attendeeKey = new PublicKey(attendeePubkey);
  const [loyaltyVaultPDA] = getLoyaltyVaultPDA(attendeeKey);

  const tx = await program.methods
    .redeemPoints(new BN(points))
    .accounts({
      loyaltyVault: loyaltyVaultPDA,
      attendee: attendeeKey,
    })
    .signers([organizer])
    .rpc();

  return { tx, redeemedPoints: points };
}
