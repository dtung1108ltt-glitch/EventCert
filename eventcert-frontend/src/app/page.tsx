"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { getEvents } from "@/lib/api";
import { Event } from "@/types";

export default function HomePage() {
  const { publicKey } = useWallet();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getEvents()
      .then((res) => setEvents(res.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const now = Date.now();
  const active = filtered.filter(
    (e) => new Date(e.startTime).getTime() <= now && new Date(e.endTime).getTime() >= now
  );
  const upcoming = filtered.filter(
    (e) => new Date(e.startTime).getTime() > now
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          🎫 EventCert
        </h1>
        <p className="text-gray-500 text-lg">
          Xác nhận tham dự sự kiện & tích điểm thưởng trên Solana
        </p>
        {!publicKey && (
          <p className="mt-4 text-sm text-blue-600 font-medium">
            Kết nối ví Phantom để check-in và nhận badge NFT
          </p>
        )}
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md mx-auto block px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải sự kiện...</div>
      ) : (
        <>
          {/* Đang diễn ra */}
          {active.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                Đang diễn ra
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((event) => (
                  <EventCard key={event.id} event={event} isActive />
                ))}
              </div>
            </section>
          )}

          {/* Sắp diễn ra */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sắp diễn ra</h2>
            {upcoming.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p>Chưa có sự kiện nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function EventCard({ event, isActive }: { event: Event; isActive?: boolean }) {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-lg">{event.name}</h3>
          {isActive && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              Đang diễn ra
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-3">
          🕐 {start.toLocaleString("vi-VN")} – {end.toLocaleString("vi-VN")}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>👥 Tối đa {event.maxAttendees} người</span>
          <span className="text-blue-600 font-medium">Xem chi tiết →</span>
        </div>
      </div>
    </Link>
  );
}
