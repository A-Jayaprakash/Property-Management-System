const mongoose = require("mongoose");

const billingPeriodSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    month: { type: Number, min: 1, max: 12, required: true },
    year:  { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expenses: [
      new mongoose.Schema(
        {
          expenseTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ExpenseType" },
          description:   { type: String, required: true },
          amount:        { type: Number, required: true, min: 0 },
        },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
);

// One billing period per property per month
billingPeriodSchema.index(
  { propertyId: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("BillingPeriod", billingPeriodSchema);
