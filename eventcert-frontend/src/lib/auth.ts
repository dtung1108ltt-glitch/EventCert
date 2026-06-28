import { WalletContextState } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

const TOKEN_KEY = "eventcert_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export async function signAndGetToken(wallet: WalletContextState): Promise<string | null> {
  if (!wallet.publicKey || !wallet.signMessage) return null;
  const message = `EventCert Auth: ${Date.now()}`;
  const msgBytes = new TextEncoder().encode(message);
  const signature = await wallet.signMessage(msgBytes);
  const headers = {
    "wallet-address": wallet.publicKey.toBase58(),
    signature: bs58.encode(signature),
    message,
  };

  // Gọi backend login để lấy JWT
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(headers),
    });
    const data = await res.json();
    if (data.token) {
      storeToken(data.token);
      return data.token;
    }
  } catch {
    // Backend chưa chạy, dùng header trực tiếp
  }
  return null;
}

export function getAuthHeaders(wallet: WalletContextState): Record<string, string> {
  const token = getStoredToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  if (!wallet.publicKey) return {};
  return {
    "wallet-address": wallet.publicKey.toBase58(),
  };
}