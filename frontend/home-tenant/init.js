// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Check if user is authenticated
  const token = getAuthToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Fetch user info and then properties
  fetchCurrentUser();
  fetchPropertiesAndUnits();
});
