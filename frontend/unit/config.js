// API Configuration
const API_BASE_URL = "http://localhost:3000/api";

// Storage utility functions
const storage = {
  get: (key) => sessionStorage.getItem(key),
  set: (key, value) => sessionStorage.setItem(key, value),
  remove: (key) => sessionStorage.removeItem(key),
  clear: () => sessionStorage.clear(),
};

// Get token from sessionStorage
const token = storage.get("authToken");

// Check if token exists and is valid format
function isValidToken(token) {
  if (!token || token === "null" || token === "undefined") return false;

  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;

    if (payload.exp && payload.exp < currentTime) {
      console.log("Token has expired");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid token format:", error);
    return false;
  }
}

// Redirect to login if no valid token
function checkAuth() {
  if (!token || !isValidToken(token)) {
    console.log("No valid token found. Redirecting to login...");
    // Clear any existing session data
    storage.clear();

    // Redirect to login page
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// API helper function with automatic token handling
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle authentication errors
    if (response.status === 401) {
      console.log("Authentication failed. Redirecting to login...");
      storage.clear();
      window.location.href = "login.html";
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Initialize authentication check
if (checkAuth()) {
  window.authToken = token;
  window.storage = storage;
  window.apiRequest = apiRequest;
}
