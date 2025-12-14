import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    organizationName: String,

    documents: [
      {
        type: String // encrypted references or URLs
      }
    ],

    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING_VERIFICATION'
    },

    adminNotes: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);
