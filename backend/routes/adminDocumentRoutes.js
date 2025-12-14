import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import { previewAgentDocument } from "../controllers/adminDocumentController.js";

const router = express.Router();

router.get(
  "/agent/:agentId/document/:documentIndex",
  protect,
  requireAdmin,
  previewAgentDocument
);

export default router;
