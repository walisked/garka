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

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },

    requestStatus: {
      type: String,
      enum: ["submitted", "claimed", "in_progress", "completed", "rejected"],
      default: "submitted"
    },

    termsAccepted: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("VerificationRequest", verificationRequestSchema);
