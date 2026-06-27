import { Router, Response } from "express";
import { awardPoints, redeemPoints } from "./loyalty.service";
import { verifyWallet, AuthRequest } from "../../middleware/auth";

const router = Router();

// POST /loyalty/award - Cộng điểm
router.post("/award", verifyWallet, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, organizerPubkey, points } = req.body;
    const result = await awardPoints(eventId, organizerPubkey, req.walletAddress!, points);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /loyalty/redeem - Đổi điểm
router.post("/redeem", verifyWallet, async (req: AuthRequest, res: Response) => {
  try {
    const { points } = req.body;
    const result = await redeemPoints(req.walletAddress!, points);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
