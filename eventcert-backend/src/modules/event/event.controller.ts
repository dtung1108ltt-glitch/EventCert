import { Router, Request, Response } from "express";
import { createEvent, createQrSession } from "./event.service";
import { verifyWallet, AuthRequest } from "../../middleware/auth";

const router = Router();

// POST /events - Tạo sự kiện mới
router.post("/", verifyWallet, async (req: AuthRequest, res: Response) => {
  try {
    const result = await createEvent(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /events/:eventId/qr - Tạo QR session
router.post("/:eventId/qr", verifyWallet, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const result = await createQrSession(eventId, req.walletAddress!);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
