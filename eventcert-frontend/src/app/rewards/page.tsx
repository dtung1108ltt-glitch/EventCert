"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getRewards, redeemPoints, getLoyaltyBalance } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { Reward } from "@/types";

export default function RewardsPage() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes] = await Promise.all([getRewards()]);
        setRewards(rRes.data?.data || []);
        if (publicKey) {
          const headers = await getAuthHeaders(wallet);
          const bRes = await getLoyaltyBalance(headers);
          setBalance(bRes.data?.data?.availablePoints ?? 0);
        }
      } catch {
        setRewards([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [publicKey]);

  const handleRedeem = async (reward: Reward) => {
    if (!publicKey || balance < reward.pointsRequired) return;
    setRedeeming(reward.id);
    try {
      const headers = await getAuthHeaders(wallet);
      await redeemPoints({ rewardId: reward.id, points: reward.pointsRequired }, headers);
      setBalance((prev) => prev - reward.pointsRequired);
      alert(`✅ Đổi thành công: ${reward.name}`);
    } catch (err: any) {
      alert(err.response?.data?.error || "Đổi quà thất bại");
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🎁 Danh sách phần thưởng</h1>
        {publicKey && (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
            💰 {balance} điểm
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎁</p>
          <p className="text-gray-500">Chưa có phần thưởng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rewards.map((reward) => {
            const canRedeem = publicKey && balance >= reward.pointsRequired;
            return (
              <div key={reward.id} className="bg-white rounded-xl border border-gray-200 p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    {reward.pointsRequired} điểm
                  </p>
                </div>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canRedeem || redeeming === reward.id}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {redeeming === reward.id ? "Đang đổi..." : "Đổi ngay"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
