const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters long"],
      maxlength: [100, "Full name must not exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^[\+]?[\d\s\-\(\)]{10,15}$/,
        "Please enter a valid phone number",
      ],
    },

    assignedUnit: {
      type: String,
      required: [true, "Assigned unit is required"],
      trim: true,
    },

    // ADD THIS FIELD - Reference to the Unit document
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit ID is required"],
    },

    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: "India",
      },
    },

    leaseStartDate: {
      type: Date,
      required: [true, "Lease start date is required"],
    },

    leaseEndDate: {
      type: Date,
      required: [true, "Lease end date is required"],
      validate: {
        validator: function (value) {
          return value > this.leaseStartDate;
        },
        message: "Lease end date must be after lease start date",
      },
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Terminated"],
      default: "Active",
    },

    monthlyRent: {
      type: Number,
      min: [0, "Monthly rent cannot be negative"],
    },

    securityDeposit: {
      type: Number,
      min: [0, "Security deposit cannot be negative"],
    },

    notes: {
      type: String,
      maxlength: [500, "Notes must not exceed 500 characters"],
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for lease duration in months
tenantSchema.virtual("leaseDurationMonths").get(function () {
  if (this.leaseStartDate && this.leaseEndDate) {
    const diffTime = Math.abs(this.leaseEndDate - this.leaseStartDate);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }
  return 0;
});

// Virtual for days remaining in lease
tenantSchema.virtual("daysRemaining").get(function () {
  if (this.leaseEndDate) {
    const today = new Date();
    const diffTime = this.leaseEndDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Pre-save middleware to format phone number
tenantSchema.pre("save", function (next) {
  if (this.phoneNumber) {
    // Remove all non-digit characters except +
    this.phoneNumber = this.phoneNumber.replace(/[^\d+]/g, "");
  }
  next();
});

// Static method to find tenants by unit (updated to use unitId)
tenantSchema.statics.findByUnit = function (unitId) {
  return this.find({ unitId: unitId });
};

// Static method to find tenants by unit number (keeping for backward compatibility)
tenantSchema.statics.findByUnitNumber = function (unitNumber) {
  return this.find({ assignedUnit: unitNumber });
};

// Static method to find expiring leases
tenantSchema.statics.findExpiringLeases = function (daysAhead = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return this.find({
    leaseEndDate: { $lte: futureDate },
    status: "Active",
  });
};

// Instance method to check if lease is expired
tenantSchema.methods.isLeaseExpired = function () {
  return this.leaseEndDate < new Date();
};

// Instance method to extend lease
tenantSchema.methods.extendLease = function (newEndDate) {
  if (newEndDate <= this.leaseEndDate) {
    throw new Error("New end date must be after current lease end date");
  }
  this.leaseEndDate = newEndDate;
  return this.save();
};

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;
