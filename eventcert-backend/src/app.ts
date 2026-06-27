import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error";
import eventRouter from "./modules/event/event.controller";
import checkinRouter from "./modules/checkin/checkin.controller";
import badgeRouter from "./modules/badge/badge.controller";
import loyaltyRouter from "./modules/loyalty/loyalty.controller";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/events", eventRouter);
app.use("/api/checkin", checkinRouter);
app.use("/api/badge", badgeRouter);
app.use("/api/loyalty", loyaltyRouter);

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", service: "eventcert-backend" }));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 EventCert Backend running on port ${PORT}`);
});

export default app;
