import { PublicKey } from "@solana/web3.js";
import { getProgram } from "../../solana/program";
import { getEventPDA } from "../../solana/transactions";
import { getOrganizerKeypair } from "../../solana/client";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

export interface CreateEventDto {
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  maxAttendees: number;
}

export async function createEvent(dto: CreateEventDto) {
  const program = getProgram();
  const organizer = getOrganizerKeypair();
  const eventId = uuidv4();

  const [eventPDA] = getEventPDA(organizer.publicKey, eventId);

  await program.methods
    .initializeEvent(
      eventId,
      dto.name,
      dto.description,
      new (require("@coral-xyz/anchor").BN)(dto.startTime),
      new (require("@coral-xyz/anchor").BN)(dto.endTime),
      dto.maxAttendees
    )
    .accounts({
      eventAccount: eventPDA,
      organizer: organizer.publicKey,
      systemProgram: require("@solana/web3.js").SystemProgram.programId,
    })
    .signers([organizer])
    .rpc();

  return { eventId, eventPDA: eventPDA.toBase58() };
}

export async function createQrSession(eventId: string, organizerPubkey: string) {
  const program = getProgram();
  const organizer = getOrganizerKeypair();
  const [eventPDA] = getEventPDA(new PublicKey(organizerPubkey), eventId);

  const sessionNonce = uuidv4();

  await program.methods
    .createQrSession(sessionNonce)
    .accounts({
      eventAccount: eventPDA,
      organizer: organizer.publicKey,
    })
    .signers([organizer])
    .rpc();

  // Sinh QR code chứa thông tin check-in
  const qrPayload = JSON.stringify({ eventId, sessionNonce, eventPDA: eventPDA.toBase58() });
  const qrDataUrl = await QRCode.toDataURL(qrPayload);

  return { sessionNonce, qrDataUrl, eventPDA: eventPDA.toBase58() };
}
