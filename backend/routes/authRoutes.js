const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateToken,
  hashPassword,
  comparePassword,
} = require("../utils/authUtils");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const hashedPassword = await hashPassword(password, 10);
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      role: role || "tenant",
    });
    await newUser.save();
    return res.status(201).json({ message: "User Successfully Registered" });
  } catch (error) {
    console.log("Registration Failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
