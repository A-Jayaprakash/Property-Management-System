const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No authorization header provided.",
      });
    }

    // Check if it starts with "Bearer "
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message:
          "Access denied. Invalid authorization format. Use 'Bearer <token>'",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Check if token exists after removing Bearer prefix
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // Log the token for debugging (remove in production)
    console.log("Token received:", token.substring(0, 20) + "...");

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded.id);

    // Get user from database to ensure user still exists
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Token is not valid. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    // Provide specific error messages based on error type
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token format. Please login again.",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired. Please login again.",
      });
    } else if (error.name === "NotBeforeError") {
      return res.status(401).json({
        message: "Token not active yet.",
      });
    } else {
      return res.status(401).json({
        message: "Token verification failed.",
      });
    }
  }
};

// Authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(
          " or "
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Check if user is manager
const isManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (req.user.role !== "manager") {
    return res.status(403).json({
      message: "Access denied. Manager role required.",
    });
  }

  next();
};

// Check if user is tenant
const isTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (req.user.role !== "tenant") {
    return res.status(403).json({
      message: "Access denied. Tenant role required.",
    });
  }

  next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin role required.",
    });
  }

  next();
};

module.exports = {
  verifyToken,
  authorizeRoles,
  isManager,
  isTenant,
  isAdmin,
};
