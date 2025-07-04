async function loadProperties() {
  if (!isAuthenticated) {
    console.log("Not authenticated, cannot load properties");
    return;
  }

  const loadingIndicator = document.getElementById("loadingIndicator");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  try {
    // Show loading
    if (loadingIndicator) {
      loadingIndicator.style.display = "block";
    }

    // Clear previous messages
    if (errorMessage) {
      errorMessage.style.display = "none";
      errorMessage.textContent = "";
    }
    if (successMessage) {
      successMessage.style.display = "none";
      successMessage.textContent = "";
    }

    console.log(
      "Loading properties with token:",
      authToken ? "Present" : "Missing"
    );

    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    properties = data || [];

    console.log("Properties loaded successfully:", properties.length);

    // Call render function if it exists
    if (typeof renderProperties === "function") {
      renderProperties(properties);
    }

    // Hide loading
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading properties:", error);

    // Hide loading
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    // Show error message
    if (errorMessage) {
      errorMessage.textContent = `Failed to load properties: ${error.message}`;
      errorMessage.style.display = "block";
    }

    // If authentication error, redirect to login
    if (
      error.message.includes("Authentication failed") ||
      error.message.includes("No token provided") ||
      error.message.includes("No authentication token found")
    ) {
      setTimeout(() => {
        logout();
      }, 2000);
    }
  }
}
