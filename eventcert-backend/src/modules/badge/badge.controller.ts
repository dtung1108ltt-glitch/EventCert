import { Router, Response } from "express";
import { mintBadge } from "./badge.service";
import { verifyWallet, AuthRequest } from "../../middleware/auth";

const router = Router();

// POST /badge/mint - Mint NFT badge sau khi check-in
router.post("/mint", verifyWallet, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, organizerPubkey, metadataUri } = req.body;
    const result = await mintBadge(
      eventId,
      organizerPubkey,
      req.walletAddress!,
      metadataUri
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
