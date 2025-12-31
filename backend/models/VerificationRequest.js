import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LandProperty",
      required: true
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true
    },

    dealInitiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DealInitiator"
    },

    verificationFee: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "expired"],
      default: "pending"
    },

    // Reservation TTL for paid verifications (set on payment success)
    reservedUntil: {
      type: Date,
      default: null
    },

    paymentReference: String,
    paymentProviderReference: String,
    paidAt: Date,
    escrowStatus: {
      type: String,
      enum: ['NONE', 'HELD', 'RELEASED'],
      default: 'NONE'
    },

    requestStatus: {
      type: String,
      enum: ["submitted", "claimed", "in_progress", "completed", "rejected"],
      default: "submitted"
    },

    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'claimedByModel'
    },
    claimedByModel: String, // 'DealInitiator' or 'Agent'
    claimedAt: Date,

    adminApproved: {
      type: Boolean,
      default: false
    },

    termsAccepted: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("VerificationRequest", verificationRequestSchema);
