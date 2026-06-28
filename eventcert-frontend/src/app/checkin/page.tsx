"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { checkIn } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

function CheckInContent() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const startScan = async () => {
    setScanning(true);
    setError("");
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await handleQrData(decodedText);
        },
        () => {}
      );
    } catch {
      setError("Không thể truy cập camera.");
      setScanning(false);
    }
  };

  const handleQrData = async (data: string) => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const payload = JSON.parse(data);
      const headers = await getAuthHeaders(wallet);
      const res = await checkIn(
        {
          eventId: payload.eventId,
          organizerPubkey: payload.organizerPubkey,
          sessionNonce: payload.sessionNonce,
        },
        headers
      );
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Check-in thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <p className="text-gray-600">Vui lòng kết nối ví Phantom để check-in</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-in thành công!</h2>
          <p className="text-gray-500 text-sm mb-2">Badge NFT đã được ghi nhận on-chain</p>
          <p className="text-green-600 font-semibold mb-6">+50 điểm Loyalty</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/badges")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              Xem Badge Collection
            </button>
            <button
              onClick={() => { setResult(null); setError(""); }}
              className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl hover:bg-gray-50"
            >
              Check-in sự kiện khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        📷 Quét mã QR check-in
      </h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div id="qr-reader" className="w-full mb-4 rounded-xl overflow-hidden" />
        {!scanning && !loading && (
          <button
            onClick={startScan}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Quét bằng camera
          </button>
        )}
        {scanning && (
          <button
            onClick={() => { scannerRef.current?.stop(); setScanning(false); }}
            className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl hover:bg-gray-50"
          >
            Dừng quét
          </button>
        )}
        {loading && (
          <div className="text-center py-4 text-blue-600 font-medium">
            Đang gửi giao dịch lên Solana...
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Đang tải...</div>}>
      <CheckInContent />
    </Suspense>
  );
}