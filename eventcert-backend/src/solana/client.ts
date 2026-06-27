import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

export function getConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
  return new Connection(rpcUrl, "confirmed");
}

export function getOrganizerKeypair(): Keypair {
  const keypairPath = process.env.ORGANIZER_KEYPAIR_PATH!.replace(
    "~",
    process.env.HOME!
  );
  const raw = fs.readFileSync(keypairPath, "utf-8");
  return Keypair.fromSecretKey(Buffer.from(JSON.parse(raw)));
}

export function getProvider(): AnchorProvider {
  const connection = getConnection();
  const keypair = getOrganizerKeypair();
  const wallet = new Wallet(keypair);
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}
