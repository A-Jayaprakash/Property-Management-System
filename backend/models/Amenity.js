const mongoose = require("mongoose");

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Amenity name is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["property", "unit"],
      required: [true, "Amenity level (property or unit) is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Same name can't appear twice at the same level
amenitySchema.index({ name: 1, level: 1 }, { unique: true });

module.exports = mongoose.model("Amenity", amenitySchema);
