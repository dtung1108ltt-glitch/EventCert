"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAuthHeaders } from "@/lib/auth";
import api from "@/lib/api";

export default function HistoryPage() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) { setLoading(false); return; }
    const load = async () => {
      try {
        const headers = await getAuthHeaders(wallet);
        const res = await api.get("/loyalty/history", { headers });
        setHistory(res.data?.data || []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-gray-600">Kết nối ví để xem lịch sử giao dịch</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📋 Lịch sử giao dịch</h1>
      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500">Chưa có giao dịch nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((tx, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{tx.description || "Giao dịch"}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(tx.createdAt).toLocaleString("vi-VN")}
                  </p>
                  {tx.txSignature && (
                    <a

    href={"https://explorer.solana.com/tx/" + tx.txSignature + "?cluster=devnet"}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-blue-500 hover:underline mt-1 block"
  >
    Xem on-chain →
  </a>
)}
                </div>
                <span className={`font-bold text-sm \${tx.points > 0 ? "text-green-600" : "text-red-500"}`}>
                  {tx.points > 0 ? "+" : ""}{tx.points} điểm
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
