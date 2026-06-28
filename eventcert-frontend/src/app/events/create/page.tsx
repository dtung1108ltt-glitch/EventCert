"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

export default function CreateEventPage() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    startTime: "",
    endTime: "",
    maxAttendees: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    setLoading(true);
    setError("");
    try {
      const headers = getAuthHeaders(wallet);
      await createEvent(
        {
          name: form.name,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          maxAttendees: Number(form.maxAttendees),
        },
        headers
      );
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Tạo sự kiện thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <p className="text-gray-600">Vui lòng kết nối ví để tạo sự kiện</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">➕ Tạo sự kiện mới</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="EventCert Meetup 2026"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
          <input
            type="datetime-local"
            required
            value={form.startTime}
            onChange={e => setForm({ ...form, startTime: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
          <input
            type="datetime-local"
            required
            value={form.endTime}
            onChange={e => setForm({ ...form, endTime: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tối đa</label>
          <input
            type="number"
            required
            min={1}
            value={form.maxAttendees}
            onChange={e => setForm({ ...form, maxAttendees: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang tạo..." : "Tạo sự kiện"}
        </button>
      </form>
    </div>
  );
}