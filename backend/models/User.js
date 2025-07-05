const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    username: {
      type: String,
      minlength: 6,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      require: true,
      match: /^\d{10}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 12,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "tenant"],
      default: "tenant",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
