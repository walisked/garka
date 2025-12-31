import mongoose from "mongoose";

const landPropertySchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    landSize: {
      type: String, // e.g. "600sqm", "1 plot"
      required: true
    },

    location: {
      state: String,
      city: String,
      address: String
    },

    price: {
      type: Number,
      required: true
    },

    landUseType: {
      type: String,
      enum: ["Residential", "Commercial", "Agricultural", "Mixed"],
      required: true
    },

    images: [String],

    status: {
      type: String,
      enum: ["available", "reserved", "under_verification", "sold"],
      default: "available"
    },

    // If a property is reserved after payment, this stores the expiry
    reservedUntil: { type: Date, default: null },

    // When admin approves, property becomes visible on map
    visibleOnMap: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("LandProperty", landPropertySchema);
