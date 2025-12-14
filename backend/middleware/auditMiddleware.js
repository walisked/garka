import { logger } from '../utils/logger.js';

export default function audit(req, res, next) {
  logger.info(`${req.method} ${req.originalUrl} by ${req.user?.id || 'Guest'}`);
  next();
}
