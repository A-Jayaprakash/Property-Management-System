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
const unitRoutes = require("./routes/unitRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const { verifyToken } = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");

// Initialize Express app
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://127.0.0.1:3000",
      "http://localhost:8080",
      "https://property-management-system-1-zblf.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {});

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "Property Management System API is running...",
    status: "OK",
    endpoints: {
      auth: "/api/auth",
      properties: "/api/properties",
      tenants: "/api/tenants",
      units: "/api/units",
    },
  });
});

// Debug route to test server
app.get("/debug", (req, res) => {
  res.json({
    message: "Debug endpoint working",
    timestamp: new Date().toISOString(),
    routes: {
      auth: "/api/auth",
      authTest: "/api/auth/test",
      properties: "/api/properties",
      tenants: "/api/tenants",
      units: "/api/units",
    },
  });
});

// API Routes - Order matters! More specific routes should come first
console.log("Registering auth routes...");
app.use("/api/auth", authRoutes);

console.log("Registering protected routes...");
app.use("/api/properties", verifyToken, propertyRoutes);
app.use("/api/tenants", verifyToken, tenantRoutes);
app.use("/api/units", verifyToken, unitRoutes);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve frontend for any non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Handle 404 for API routes
app.use("/api/*", (req, res) => {
  console.log("404 - API endpoint not found:", req.path);
  res.status(404).json({ message: "API endpoint not found", path: req.path });
});

// Global error handler
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📚 API Documentation:`);
  console.log(`   - Authentication: http://localhost:${PORT}/api/auth`);
  console.log(`   - Auth Test: http://localhost:${PORT}/api/auth/test`);
  console.log(`   - Properties: http://localhost:${PORT}/api/properties`);
  console.log(`   - Tenants: http://localhost:${PORT}/api/tenants`);
  console.log(`   - Units: http://localhost:${PORT}/api/units`);
});
