const mongoose = require("mongoose");

const expenseTypeSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    level:    { type: String, enum: ["property", "unit"], default: "unit" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique name per level (same name can exist at property and unit level)
expenseTypeSchema.index({ name: 1, level: 1 }, { unique: true });

module.exports = mongoose.model("ExpenseType", expenseTypeSchema);
