"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import { getEvent, createQrSession } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import QRCode from "qrcode";

export default function EventDetailPage() {
  const { id } = useParams();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  useEffect(() => {
    if (!id) return;
    getEvent(id as string)
      .then(res => setEvent(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const generateQR = async () => {
    if (!id) return;
    setQrLoading(true);
    try {
      const headers = getAuthHeaders(wallet);
      const res = await createQrSession(id as string, headers);
      const payload = res.data.qrPayload;
      const url = await QRCode.toDataURL(payload, { width: 300 });
      setQrUrl(url);
      setSessionExpiry(new Date(res.data.expiresAt));
    } catch (err) {
      console.error(err);
    } finally {
      setQrLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Đang tải...</div>;
  if (!event) return <div className="text-center py-20 text-gray-400">Không tìm thấy sự kiện</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h1>
      <p className="text-gray-500 text-sm mb-6">
        {new Date(event.startTime).toLocaleString("vi-VN")} →{" "}
        {new Date(event.endTime).toLocaleString("vi-VN")}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{event.maxAttendees}</p>
          <p className="text-xs text-gray-500 mt-1">Tối đa</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{event._count?.checkIns || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Đã check-in</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {event.onChainId ? "✅" : "⏳"}
          </p>
          <p className="text-xs text-gray-500 mt-1">On-chain</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📱 QR Check-in</h2>

        {qrUrl ? (
          <div className="text-center">
            <img src={qrUrl} alt="QR Code" className="mx-auto mb-3 rounded-xl" />
            {sessionExpiry && (
              <p className="text-sm text-orange-500 mb-4">
                ⏱ Hết hạn lúc: {sessionExpiry.toLocaleTimeString("vi-VN")}
              </p>
            )}
            <button
              onClick={generateQR}
              className="w-full border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50"
            >
              Tạo QR mới
            </button>
          </div>
        ) : (
          <button
            onClick={generateQR}
            disabled={qrLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {qrLoading ? "Đang tạo QR..." : "Tạo mã QR check-in"}
          </button>
        )}
      </div>
    </div>
  );
}