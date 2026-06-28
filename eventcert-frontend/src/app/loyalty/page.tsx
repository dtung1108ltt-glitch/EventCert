"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getLoyaltyBalance, getLoyaltyHistory } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";

export default function LoyaltyPage() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [balance, setBalance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) { setLoading(false); return; }
    const load = async () => {
      try {
        const headers = await getAuthHeaders(wallet);
        const [balRes, histRes] = await Promise.all([
          getLoyaltyBalance(headers),
          getLoyaltyHistory(headers),
        ]);
        setBalance(balRes.data?.data);
        setHistory(histRes.data?.data || []);
      } catch {
        setBalance({ totalPoints: 0, redeemedPoints: 0, availablePoints: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">💰</p>
        <p className="text-gray-600">Kết nối ví để xem điểm thưởng</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">💰 Ví điểm thưởng</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : (
        <>
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
            <p className="text-blue-100 text-sm mb-1">Điểm hiện có</p>
            <p className="text-5xl font-bold mb-4">{balance?.availablePoints ?? 0}</p>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-blue-200">Tổng tích lũy</p>
                <p className="font-semibold">{balance?.totalPoints ?? 0}</p>
              </div>
              <div>
                <p className="text-blue-200">Đã đổi</p>
                <p className="font-semibold">{balance?.redeemedPoints ?? 0}</p>
              </div>
            </div>
          </div>

          <Link
            href="/rewards"
            className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-blue-700 mb-6"
          >
            🎁 Đổi điểm lấy quyền lợi
          </Link>

          {/* History */}
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Lịch sử giao dịch</h2>
          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Chưa có giao dịch nào</div>
          ) : (
            <div className="space-y-2">
              {history.map((tx, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <span className={`font-bold ${tx.points > 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.points > 0 ? "+" : ""}{tx.points} điểm
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
