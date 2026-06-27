import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getProvider } from "./client";
import IDL from "./idl.json";

const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || "EioDsXWiQR9DTxnk9U9jRF78hWYDp9HBBV23tvRXnYtK"
);

export function getProgram(): Program {
  const provider = getProvider();
  return new Program(IDL as any, provider);
}

export { PROGRAM_ID };
