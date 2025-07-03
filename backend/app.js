// Core modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load environment variables
dotenv.config();

// Import custom modules
const propertyRoutes = require("./routes/propertyRoutes");
const { verifyToken } = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");

// Initialize Express app
const app = express();

// ✅ Enable JSON parsing
app.use(express.json());

// ✅ Enable CORS before any routes
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://127.0.0.1:3000",
      "http://localhost:8080",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Preflight support for all routes (important)
app.options("*", cors());

// ✅ Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
connectDB();

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Property Management System API is running...",
    status: "OK",
  });
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", verifyToken, propertyRoutes);

// ✅ Static frontend served only after API routes
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Handle non-API frontend routes (e.g., /login.html, /dashboard.html)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ✅ 404 handler for unmatched API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// ✅ General error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || "development"}`);
});
