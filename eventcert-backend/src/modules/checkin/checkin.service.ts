import { PublicKey } from "@solana/web3.js";
import { getProgram } from "../../solana/program";
import { getEventPDA, getAttendeeRecordPDA, getLoyaltyVaultPDA } from "../../solana/transactions";
import { getOrganizerKeypair } from "../../solana/client";

export async function checkInAttendee(
  eventId: string,
  organizerPubkey: string,
  attendeePubkey: string,
  sessionNonce: string
) {
  const program = getProgram();
  const organizer = getOrganizerKeypair();

  const organizerKey = new PublicKey(organizerPubkey);
  const attendeeKey = new PublicKey(attendeePubkey);

  const [eventPDA] = getEventPDA(organizerKey, eventId);
  const [attendeeRecordPDA] = getAttendeeRecordPDA(eventPDA, attendeeKey);
  const [loyaltyVaultPDA] = getLoyaltyVaultPDA(attendeeKey);

  const tx = await program.methods
    .checkInAttendee(sessionNonce)
    .accounts({
      eventAccount: eventPDA,
      attendeeRecord: attendeeRecordPDA,
      loyaltyVault: loyaltyVaultPDA,
      attendee: attendeeKey,
      organizer: organizer.publicKey,
      systemProgram: require("@solana/web3.js").SystemProgram.programId,
    })
    .signers([organizer])
    .rpc();

  return {
    tx,
    attendeeRecord: attendeeRecordPDA.toBase58(),
    loyaltyVault: loyaltyVaultPDA.toBase58(),
  };
}
