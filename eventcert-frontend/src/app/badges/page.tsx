"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface Badge {
  id: string;
  eventName: string;
  checkedInAt: string;
  metadataUri: string;
  mintAddress: string;
}

export default function BadgesPage() {
  const { publicKey } = useWallet();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) { setLoading(false); return; }
    // Mock data — thay bằng API thật
    setTimeout(() => {
      setBadges([]);
      setLoading(false);
    }, 500);
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🏅</p>
        <p className="text-gray-600">Kết nối ví để xem Badge Collection</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🏅 Badge Collection</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải badge...</div>
      ) : badges.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎫</p>
          <p className="text-gray-500 text-lg">Chưa có badge nào</p>
          <p className="text-gray-400 text-sm mt-2">
            Tham dự sự kiện và check-in để nhận badge NFT đầu tiên!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-4xl">🎫</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm truncate">{badge.eventName}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(badge.checkedInAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
