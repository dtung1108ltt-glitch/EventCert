import { Router, Response } from "express";
import { checkInAttendee } from "./checkin.service";
import { verifyWallet, AuthRequest } from "../../middleware/auth";

const router = Router();

// POST /checkin - Người dùng quét QR và check-in
router.post("/", verifyWallet, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, organizerPubkey, sessionNonce } = req.body;
    const result = await checkInAttendee(
      eventId,
      organizerPubkey,
      req.walletAddress!,
      sessionNonce
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
