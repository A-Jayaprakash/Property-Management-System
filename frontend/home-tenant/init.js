// Enhanced init.js with fallback data and better error handling
document.addEventListener("DOMContentLoaded", function () {
  // Check if user is authenticated
  const token = getAuthToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Initialize with loading state
  initializeLoadingState();

  // Fetch user info and then properties
  fetchCurrentUser();
  fetchPropertiesAndUnits();
});

// Initialize loading state
function initializeLoadingState() {
  // Update stats with loading state
  document.getElementById("totalProperties").textContent = "Loading...";
  document.getElementById("availableUnits").textContent = "Loading...";
  document.getElementById("avgRent").textContent = "Loading...";
  updateStats();
}
