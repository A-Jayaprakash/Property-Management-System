const mongoose = require("mongoose");

const chargeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    chargeType: {
      type: String,
      enum: ["Normal", "Reading", "Usage"],
      required: true,
    },
    level: {
      type: String,
      enum: ["property", "unit"],
      required: true,
    },
    // Rate per unit — only meaningful for Reading and Usage types
    rate: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Same name cannot exist twice at the same level
chargeSchema.index({ name: 1, level: 1 }, { unique: true });

module.exports = mongoose.model("Charge", chargeSchema);
