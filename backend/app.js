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

// CORS: allow local dev and optionally any deployed frontend domain(s)
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://localhost:8080",
  "https://property-management-system-2.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (e.g., curl, server-to-server) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight
app.options("*", cors());

// Simple request logger
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mongo connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not defined in environment");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      // serverSelectionTimeoutMS: 10000, // uncomment if needed
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error?.message || error);
    process.exit(1);
  }
};

connectDB();

// Health endpoint (useful for Render health checks)
app.get("/", (_req, res) => {
  res.json({
    status: "OK",
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// Debug route to test server
app.get("/debug", (_req, res) => {
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

// API Routes - Order matters
console.log("Registering auth routes...");
app.use("/api/auth", authRoutes);

console.log("Registering protected routes...");
app.use("/api/properties", verifyToken, propertyRoutes);
app.use("/api/tenants", verifyToken, tenantRoutes);
app.use("/api/units", verifyToken, unitRoutes);

// Serve static files from frontend (optional: only if frontend is in this repo)
// Serve static files from frontend
// Serve static files from frontend
const frontendPath = path.join(process.cwd(), "frontend");
console.log("Frontend path:", frontendPath); // Debug log
app.use(express.static(frontendPath));

// Serve index.html for any non-API routes
app.get(/^\/(?!api).*/, (req, res, next) => {
  const indexPath = path.join(frontendPath, "index.html");
  console.log("Trying to serve:", indexPath); // Debug log

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.log("Error serving index.html:", err.message);
      next(); // fall through to next handler if file not found
    }
  });
});

// Handle 404 for API routes
app.use("/api/*", (req, res) => {
  console.log("404 - API endpoint not found:", req.path);
  res.status(404).json({ message: "API endpoint not found", path: req.path });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err?.stack || err);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err?.message
        : "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("📚 API Documentation:");
  console.log(` - Authentication: http://localhost:${PORT}/api/auth`);
  console.log(` - Auth Test: http://localhost:${PORT}/api/auth/test`);
  console.log(` - Properties: http://localhost:${PORT}/api/properties`);
  console.log(` - Tenants: http://localhost:${PORT}/api/tenants`);
  console.log(` - Units: http://localhost:${PORT}/api/units`);
});
