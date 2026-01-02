import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    phone: {
      type: String,
      required: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["USER", "AGENT", "DEAL_INITIATOR", "ADMIN"],
      default: "USER"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    // Invitation / activation fields for admin-invited accounts
    invited: {
      type: Boolean,
      default: false
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    activationToken: String,
    activationExpires: Date,
    isActivated: {
      type: Boolean,
      default: true
    },

    lastLogin: Date,
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile'
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
