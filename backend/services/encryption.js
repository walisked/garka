import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export const encryptBuffer = (buffer, password) => {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    const key = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]);
  } catch (error) {
    logger.error(`Encryption error: ${error.message}`);
    throw new Error('Encryption failed');
  }
};

export const decryptBuffer = (encryptedBuffer, password) => {
  try {
    const salt = encryptedBuffer.slice(0, SALT_LENGTH);
    const iv = encryptedBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
  } catch (error) {
    logger.error(`Decryption error: ${error.message}`);
    throw new Error('Decryption failed');
  }
};

export const encryptAndStoreDocument = async (file, userId) => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'encrypted', String(userId));
    await fsp.mkdir(uploadDir, { recursive: true });

    const encryptedData = encryptBuffer(file.buffer, process.env.ENCRYPTION_KEY);
    const filename = `${Date.now()}-${file.originalname}.enc`;
    const filepath = path.join(uploadDir, filename);

    await fsp.writeFile(filepath, encryptedData);

    return {
      filename,
      path: filepath,
      originalName: file.originalname,
      size: encryptedData.length,
      mimeType: file.mimetype,
      encryptedAt: new Date()
    };
  } catch (error) {
    logger.error(`Store document error: ${error.message}`);
    throw error;
  }
};

export const decryptDocument = async (filepath) => {
  try {
    const encryptedData = await fsp.readFile(filepath);
    return decryptBuffer(encryptedData, process.env.ENCRYPTION_KEY);
  } catch (error) {
    logger.error(`Decrypt document error: ${error.message}`);
    throw error;
  }
};
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
