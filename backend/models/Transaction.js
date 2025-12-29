import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'] },
    type: String,
    provider: String,
    providerReference: String,
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: mongoose.Schema.Types.Mixed,
    processedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', TransactionSchema);
