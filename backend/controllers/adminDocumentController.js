import Agent from "../models/Agent.js";
import decryptFile from "../utils/decryptFile.js";

export const previewAgentDocument = async (req, res) => {
  const { agentId, documentIndex } = req.params;

  const agent = await Agent.findById(agentId);
  if (!agent || !agent.landDocuments[documentIndex]) {
    return res.status(404).json({ message: "Document not found" });
  }

  const decryptedBuffer = decryptFile(
    agent.landDocuments[documentIndex]
  );

  res.set("Content-Type", "application/pdf"); // or image/*
  res.send(decryptedBuffer);
};
//⚠️ You can dynamically detect file type later when AI/OCR is introduced.