import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/wallet/WalletProvider";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventCert – Digital Proof of Attendance",
  description: "Proof of Attendance & Loyalty Platform on Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SolanaWalletProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
