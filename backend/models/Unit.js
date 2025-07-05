const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unit_number: {
      type: String,
      required: true,
      trim: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "1BHK",
        "2BHK",
        "3BHK",
        "4BHK",
        "Studio",
        "Penthouse",
        "Office",
        "Shop",
        "Warehouse",
      ],
      required: true,
    },
    area: {
      type: Number,
      required: true,
      min: 1,
    },
    area_unit: {
      type: String,
      enum: ["sqft", "sqm"],
      default: "sqft",
    },
    floor: {
      type: Number,
      required: true,
      min: 0,
    },
    rent: {
      type: Number,
      required: true,
      min: 0,
    },
    security_deposit: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
    },
    amenities: [
      {
        type: String,
        enum: [
          "AC",
          "Heating",
          "Balcony",
          "Parking",
          "Storage",
          "Furnished",
          "Semi-Furnished",
          "Wifi",
          "Gym",
          "Pool",
          "Garden",
          "Security",
          "Elevator",
          "Power Backup",
          "Water Supply",
          "Intercom",
        ],
      },
    ],
    description: {
      type: String,
      maxlength: 1000,
    },
    maintenance_fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    last_maintenance: {
      type: Date,
    },
    next_maintenance: {
      type: Date,
    },
    images: [
      {
        type: String, // URLs to unit images
      },
    ],
    lease_terms: {
      min_lease_duration: {
        type: Number,
        default: 12, // months
        min: 1,
      },
      max_lease_duration: {
        type: Number,
        default: 36, // months
        min: 1,
      },
      notice_period: {
        type: Number,
        default: 30, // days
        min: 1,
      },
    },
    utilities: {
      electricity: {
        type: String,
        enum: ["included", "separate", "shared"],
        default: "separate",
      },
      water: {
        type: String,
        enum: ["included", "separate", "shared"],
        default: "included",
      },
      gas: {
        type: String,
        enum: ["included", "separate", "shared", "not_available"],
        default: "separate",
      },
      internet: {
        type: String,
        enum: ["included", "separate", "not_available"],
        default: "separate",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique unit numbers within the same property
unitSchema.index({ unit_number: 1, property: 1 }, { unique: true });

// Index for efficient queries
unitSchema.index({ property: 1, status: 1 });
unitSchema.index({ type: 1, rent: 1 });
unitSchema.index({ created_by: 1 });

// Virtual to get current tenant
unitSchema.virtual("current_tenant", {
  ref: "Tenant",
  localField: "_id",
  foreignField: "assigned_unit",
  justOne: true,
});

// Virtual to calculate total monthly cost
unitSchema.virtual("total_monthly_cost").get(function () {
  return this.rent + this.maintenance_fee;
});

// Pre-save middleware to validate lease terms
unitSchema.pre("save", function (next) {
  if (
    this.lease_terms.min_lease_duration > this.lease_terms.max_lease_duration
  ) {
    const err = new Error(
      "Minimum lease duration cannot be greater than maximum lease duration"
    );
    return next(err);
  }
  next();
});

// Static method to get available units
unitSchema.statics.getAvailableUnits = function (propertyId) {
  return this.find({
    property: propertyId,
    status: "available",
    is_active: true,
  }).populate("property", "name address");
};

// Static method to get units by property
unitSchema.statics.getUnitsByProperty = function (propertyId) {
  return this.find({
    property: propertyId,
    is_active: true,
  })
    .populate("property", "name address type")
    .populate("current_tenant", "name email phone status");
};

// Instance method to check if unit is available for rent
unitSchema.methods.isAvailableForRent = function () {
  return this.status === "available" && this.is_active;
};

// Instance method to update unit status
unitSchema.methods.updateStatus = function (newStatus, reason) {
  this.status = newStatus;
  if (reason) {
    this.status_reason = reason;
  }
  return this.save();
};

module.exports = mongoose.model("Unit", unitSchema);
