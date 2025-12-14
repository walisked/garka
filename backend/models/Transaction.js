import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'] }
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', TransactionSchema);
