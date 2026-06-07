const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
  },
  type: {
    type: String,
    enum: [
      "Apartment",
      "House",
      "Condo",
      "Villa",
      "Studio",
      "Penthouse",
      "Commercial",
    ],
    required: true,
  },
  unitCount: {
    type: Number,
    min: 1,
    required: true,
  },
  amenities: [
    {
      type: String,
      enum: [
        "Elevator",
        "Gym",
        "Pool",
        "Garden",
        "Security",
        "Parking",
        "Power Backup",
        "Intercom",
        "Water Supply",
      ],
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Property", propertySchema);
