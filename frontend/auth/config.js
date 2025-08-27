// config.js
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://property-management-system-2.onrender.com";

console.log("API Base URL:", API_BASE_URL);
