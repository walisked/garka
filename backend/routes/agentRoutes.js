import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAgent } from "../middleware/roleMiddleware.js";
import { uploadLandDocuments } from "../controllers/agentController.js";

const router = express.Router();

router.post(
  "/documents",
  protect,
  requireAgent,
  upload.array("documents", 5),
  uploadLandDocuments
);

export default router;
