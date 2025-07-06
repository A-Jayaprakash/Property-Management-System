const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");
const {
  generateToken,
  hashPassword,
  comparePassword,
} = require("../utils/authUtils");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", async (req, res) => {
  try {
    console.log("POST /api/auth/login called");
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
    console.log("POST /api/auth/register called");
    const { name, username, email, phone, password, role } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const hashedPassword = await hashPassword(password, 10);
    const newUser = new User({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      role: role || "tenant",
    });
    await newUser.save();
    if (role === "tenant") {
      const newTenant = new Tenant({
        name,
        username,
        email,
        phone,
      });
      await newTenant.save();
    }
    return res.status(201).json({ message: "User Successfully Registered" });
  } catch (error) {
    console.log("Registration Failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Protected route (requires authentication)
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("GET /api/auth called");
    console.log("req.user:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Since verifyToken middleware already fetches the user, just return it
    res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Debug route to check if routes are working
router.get("/test", (req, res) => {
  console.log("GET /api/auth/test called");
  res.json({ message: "Auth routes are working!" });
});

module.exports = router;
