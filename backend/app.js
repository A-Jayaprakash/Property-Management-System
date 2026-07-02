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
const amenityRoutes     = require("./routes/amenityRoutes");
const chargeRoutes      = require("./routes/chargeRoutes");
const expenseTypeRoutes = require("./routes/expenseTypeRoutes");
const billingRoutes     = require("./routes/billingRoutes");
const expenseRoutes     = require("./routes/expenseRoutes");
const reportRoutes      = require("./routes/reportRoutes");
const { verifyToken } = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");

// Initialize Express app
const app = express();
app.use(express.json());

// CORS: allow local dev and any *.onrender.com subdomain (covers redeployments)
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (e.g., curl, server-to-server), local dev origins,
      // and any onrender.com subdomain so redeployments never need a CORS update
      if (!origin || allowedOrigins.includes(origin) || /\.onrender\.com$/.test(origin)) {
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

// Seed default amenities if the collection is empty
const seedAmenities = async () => {
  try {
    const Amenity = require("./models/Amenity");
    const count = await Amenity.countDocuments();
    if (count === 0) {
      const defaults = [
        // Property-level (building-wide)
        { name: "Elevator",     level: "property" },
        { name: "Gym",          level: "property" },
        { name: "Pool",         level: "property" },
        { name: "Garden",       level: "property" },
        { name: "Security",     level: "property" },
        { name: "Parking",      level: "property" },
        { name: "Power Backup", level: "property" },
        { name: "Intercom",     level: "property" },
        { name: "Water Supply", level: "property" },
        // Unit-level (per unit)
        { name: "AC",             level: "unit" },
        { name: "Heating",        level: "unit" },
        { name: "Balcony",        level: "unit" },
        { name: "Storage",        level: "unit" },
        { name: "Furnished",      level: "unit" },
        { name: "Semi-Furnished", level: "unit" },
        { name: "Wifi",           level: "unit" },
      ];
      await Amenity.insertMany(defaults);
      console.log(`Seeded ${defaults.length} default amenities`);
    }
  } catch (err) {
    console.error("Failed to seed amenities:", err.message);
  }
};

// Seed default charges and expense types if the collections are empty
const seedChargesAndExpenses = async () => {
  try {
    const Charge      = require("./models/Charge");
    const ExpenseType = require("./models/ExpenseType");

    const chargeCount = await Charge.countDocuments();
    if (chargeCount === 0) {
      await Charge.insertMany([
        // Unit-level charges
        { name: "EB Charges",          chargeType: "Reading", level: "unit",     rate: 8, isActive: true  },
        { name: "Water Charges",       chargeType: "Normal",  level: "unit",     rate: 0, isActive: true  },
        { name: "General Maintenance", chargeType: "Normal",  level: "unit",     rate: 0, isActive: true  },
        // Property-level charges
        { name: "Property Housekeeping",     chargeType: "Normal", level: "property", rate: 0, isActive: true  },
        { name: "Swimming Pool",             chargeType: "Normal", level: "property", rate: 0, isActive: true  },
        { name: "Common Plumbing",           chargeType: "Normal", level: "property", rate: 0, isActive: false },
        { name: "Common Lighting",           chargeType: "Normal", level: "property", rate: 0, isActive: false },
        { name: "Swimming Pool Maintenance", chargeType: "Normal", level: "property", rate: 0, isActive: false },
      ]);
      console.log("Seeded default charges");
    } else {
      // Migration: move "Swimming Pool Usage" from unit level to property level and rename
      await Charge.updateOne(
        { $or: [{ name: "Swimming Pool Usage" }, { name: "Swimming Pool" }] },
        { $set: { name: "Swimming Pool", level: "property", chargeType: "Normal" } }
      );
    }

    const expenseCount = await ExpenseType.countDocuments();
    if (expenseCount === 0) {
      await ExpenseType.insertMany([
        { name: "Property Tax",               level: "property" },
        { name: "Water Tax",                  level: "property" },
        { name: "Building Maintenance",       level: "property" },
        { name: "Painting Material & Labour", level: "unit" },
        { name: "Electrical Works",           level: "unit" },
        { name: "Plumbing Material & Labour", level: "unit" },
      ]);
      console.log("Seeded default expense types");
    } else {
      // Migration: set level on existing records that are missing it
      await ExpenseType.updateMany({ level: { $exists: false } }, { $set: { level: "unit" } });
      await ExpenseType.updateMany(
        { name: { $in: ["Property Tax", "Water Tax", "Building Maintenance"] }, level: "unit" },
        { $set: { level: "property" } }
      );
    }
  } catch (err) {
    console.error("Failed to seed charges/expense types:", err.message);
  }
};

connectDB().then(seedAmenities).then(seedChargesAndExpenses);

// Health endpoint (useful for Render health checks)
/*
app.get("/", (_req, res) => {
  res.json({
    status: "OK",
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});
*/
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
        amenities: "/api/amenities",
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
app.use("/api/amenities",      verifyToken, amenityRoutes);
app.use("/api/charges",       verifyToken, chargeRoutes);
app.use("/api/expense-types", verifyToken, expenseTypeRoutes);
app.use("/api/billing",       verifyToken, billingRoutes);
app.use("/api/expenses",      verifyToken, expenseRoutes);
app.use("/api/reports",       verifyToken, reportRoutes);

// Serve static files from frontend (optional: only if frontend is in this repo)
// Serve static files from frontend
// Serve static files from frontend
const frontendPath = path.join(__dirname, "..", "frontend");
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
