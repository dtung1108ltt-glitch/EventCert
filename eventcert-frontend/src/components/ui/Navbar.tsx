"use client";
import Link from "next/link";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then(m => m.WalletMultiButton),
  { ssr: false }
);

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl text-blue-600">
              🎫 EventCert
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">Sự kiện</Link>
            <Link href="/badges" className="text-gray-600 hover:text-gray-900 text-sm">Badge Collection</Link>
            <Link href="/loyalty" className="text-gray-600 hover:text-gray-900 text-sm">Điểm thưởng</Link>
            <Link href="/rewards" className="text-gray-600 hover:text-gray-900 text-sm">Đổi quà</Link>
            <Link href="/history" className="text-gray-600 hover:text-gray-900 text-sm">Lịch sử</Link>
          </div>
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
        </div>
      </div>
    </nav>
  );
}