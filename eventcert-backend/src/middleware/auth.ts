import { Request, Response, NextFunction } from "express";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

export interface AuthRequest extends Request {
  walletAddress?: string;
}

// Verify wallet signature: client ký message bằng Phantom, backend xác thực
export function verifyWallet(req: AuthRequest, res: Response, next: NextFunction) {
  const { walletAddress, signature, message } = req.headers as any;

  if (!walletAddress || !signature || !message) {
    return res.status(401).json({ error: "Missing auth headers" });
  }

  try {
    const publicKey = new PublicKey(walletAddress);
    const msgBytes = Buffer.from(message, "utf-8");
    const sigBytes = bs58.decode(signature);
    const pubKeyBytes = publicKey.toBytes();

    const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
    if (!valid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    req.walletAddress = walletAddress;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Auth failed" });
  }
}
