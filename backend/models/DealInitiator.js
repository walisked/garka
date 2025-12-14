import mongoose from "mongoose";

const dealInitiatorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    specialization: String,
    experienceYears: Number,
    qualifications: [String],
    documents: [String],
    claimLimit: { type: Number, default: 5 },
    completedClaims: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    isTopG: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED'],
      default: 'PENDING_VERIFICATION'
    }
  },
  { timestamps: true }
);

export default mongoose.model("DealInitiator", dealInitiatorSchema);
