const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Hash password
const hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
};

// Compare password
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
};
