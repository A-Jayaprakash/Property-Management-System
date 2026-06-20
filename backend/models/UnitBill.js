const mongoose = require("mongoose");

// One line per charge type on the tenant's bill
const lineItemSchema = new mongoose.Schema(
  {
    chargeId:    { type: mongoose.Schema.Types.ObjectId, ref: "Charge" },
    description: { type: String, required: true },
    chargeType:  { type: String, enum: ["Normal", "Reading", "Usage"], required: true },
    // Reading-type fields
    prevReading: { type: Number },
    currReading: { type: Number },
    // Reading: currReading-prevReading | Usage: user-entered units | Normal: null
    units:  { type: Number },
    // Rate locked at bill creation time (not affected by future config changes)
    rate:   { type: Number },
    // Always server-computed; never trusted from client
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

// Ad-hoc expense charged to this unit (painting, plumbing, etc.)
const miscItemSchema = new mongoose.Schema(
  {
    expenseTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ExpenseType" },
    description:   { type: String, required: true },
    amount:        { type: Number, required: true },
  },
  { _id: false }
);

const unitBillSchema = new mongoose.Schema(
  {
    billingPeriodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BillingPeriod",
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    // Frozen at publish — stays accurate after tenant relocations / rent changes
    tenantSnapshot: new mongoose.Schema(
      { fullName: String, phoneNumber: String },
      { _id: false }
    ),
    // 'type' as a key inside a plain object literal confuses Mongoose's type-detection,
    // so we use an explicit Schema here to declare it as a regular field.
    unitSnapshot: new mongoose.Schema(
      { unit_number: String, type: String, floor: Number },
      { _id: false }
    ),
    rentAmount:  { type: Number, required: true, min: 0 },
    lineItems:   [lineItemSchema],
    miscItems:   [miscItemSchema],
    // server-computed: rentAmount + Σ lineItems + Σ miscItems
    totalAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// One bill per unit per billing period
unitBillSchema.index({ billingPeriodId: 1, unitId: 1 }, { unique: true });

module.exports = mongoose.model("UnitBill", unitBillSchema);
