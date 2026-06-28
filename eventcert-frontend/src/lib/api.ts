import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

// Events
export const getEvents = () => api.get("/events");
export const getEvent = (id: string) => api.get(`/events/${id}`);
export const createEvent = (data: any, headers: any) =>
  api.post("/events", data, { headers });
export const createQrSession = (eventId: string, headers: any) =>
  api.post(`/events/${eventId}/qr-session`, {}, { headers });

// Check-in
export const checkIn = (data: any, headers: any) =>
  api.post("/checkin", data, { headers });

// Badge
export const mintBadge = (data: any, headers: any) =>
  api.post("/badge/mint", data, { headers });

// Loyalty
export const getLoyaltyBalance = (headers: any) =>
  api.get("/loyalty/balance", { headers });
export const getLoyaltyHistory = (headers: any) =>
  api.get("/loyalty/history", { headers });
export const awardPoints = (data: any, headers: any) =>
  api.post("/loyalty/award", data, { headers });
export const redeemPoints = (data: any, headers: any) =>
  api.post("/loyalty/redeem", data, { headers });

// Rewards
export const getRewards = () => api.get("/rewards");

export default api;
