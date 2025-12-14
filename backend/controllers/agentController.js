import Agent from '../models/Agent.js';
import { encryptFile } from '../services/encryption.js';
import { success, failure } from '../utils/response.js';

export const uploadLandDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return failure(res, 'No files uploaded', 400);

    const agent = await Agent.findOne({ user: req.user.id });
    if (!agent) return failure(res, 'Agent profile not found', 404);

    const encryptedPaths = req.files.map((file) => {
      const encryptedPath = `uploads/encrypted/${Date.now()}-${file.originalname}.enc`;
      encryptFile(file.path, encryptedPath);
      return encryptedPath;
    });

    agent.documents = [...(agent.documents || []), ...encryptedPaths];
    agent.status = 'PENDING_VERIFICATION';
    await agent.save();

    return success(res, { documents: encryptedPaths }, 'Documents uploaded successfully');
  } catch (error) {
    return failure(res, 'Failed to upload documents', 500);
  }
};
