import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  eventId: { type: String, required: true, index: true, unique: true },
  payload: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

// Keep webhook events for 7 days by default
webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
export default mongoose.model('WebhookEvent', webhookEventSchema);