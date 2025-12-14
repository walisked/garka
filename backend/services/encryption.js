import crypto from 'crypto';
import fs from 'fs';
import { logger } from '../utils/logger.js';

const algorithm = 'aes-256-cbc';

function getKey() {
  const secret = process.env.ENCRYPTION_KEY || process.env.FILE_SECRET || 'default_encryption_key_please_change';
  // Derive a 32-byte key from the passphrase
  return crypto.scryptSync(secret, 'salt', 32);
}

export function encryptFile(inputPath, outputPath) {
  try {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const data = fs.readFileSync(inputPath);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const payload = Buffer.concat([iv, encrypted]);
    fs.writeFileSync(outputPath, payload);
    return outputPath;
  } catch (error) {
    logger.error(`Encrypt file failed: ${error.message}`);
    throw error;
  }
}

export function decryptFile(encryptedPath, outputPath) {
  try {
    const key = getKey();
    const payload = fs.readFileSync(encryptedPath);
    const iv = payload.slice(0, 16);
    const encrypted = payload.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    fs.writeFileSync(outputPath, decrypted);
    return outputPath;
  } catch (error) {
    logger.error(`Decrypt file failed: ${error.message}`);
    throw error;
  }
}
