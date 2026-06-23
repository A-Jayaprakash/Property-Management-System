const mongoose = require("mongoose");

const expenseItemSchema = new mongoose.Schema(
  {
    expenseTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ExpenseType" },
    description:   { type: String, default: "" },
    amount:        { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const expensePeriodSchema = new mongoose.Schema(
  {
    propertyId:    { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    month:         { type: Number, min: 1, max: 12, required: true },
    year:          { type: Number, required: true },
    status:        { type: String, enum: ["draft", "finalized"], default: "draft" },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyItems: [expenseItemSchema],
  },
  { timestamps: true }
);

expensePeriodSchema.index({ propertyId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("ExpensePeriod", expensePeriodSchema);
