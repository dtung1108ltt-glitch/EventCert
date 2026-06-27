import { PublicKey } from "@solana/web3.js";
import { getProgram } from "../../solana/program";
import { getEventPDA, getAttendeeRecordPDA, getBadgeMintPDA } from "../../solana/transactions";
import { getOrganizerKeypair } from "../../solana/client";

export async function mintBadge(
  eventId: string,
  organizerPubkey: string,
  attendeePubkey: string,
  metadataUri: string
) {
  const program = getProgram();
  const organizer = getOrganizerKeypair();

  const organizerKey = new PublicKey(organizerPubkey);
  const attendeeKey = new PublicKey(attendeePubkey);

  const [eventPDA] = getEventPDA(organizerKey, eventId);
  const [attendeeRecordPDA] = getAttendeeRecordPDA(eventPDA, attendeeKey);
  const [badgeMintPDA] = getBadgeMintPDA(attendeeRecordPDA);

  const tx = await program.methods
    .mintBadge(metadataUri)
    .accounts({
      eventAccount: eventPDA,
      attendeeRecord: attendeeRecordPDA,
      badgeMint: badgeMintPDA,
      attendee: attendeeKey,
      organizer: organizer.publicKey,
      systemProgram: require("@solana/web3.js").SystemProgram.programId,
    })
    .signers([organizer])
    .rpc();

  return { tx, badgeMint: badgeMintPDA.toBase58() };
}
