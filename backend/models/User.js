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

    passwordHash: {
      type: String,
      required: true
    },

      // Store hashed password in `password`
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
    }
    ,
    lastLogin: Date,
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile'
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
