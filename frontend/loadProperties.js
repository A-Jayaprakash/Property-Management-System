async function loadProperties() {
  try {
    showLoading(true);
    console.log("Loading properties from:", API_BASE_URL);

    // Check if authenticated before making request
    if (!isAuthenticated || !authToken) {
      console.error("Not authenticated, cannot load properties");
      showError("Authentication required. Please login again.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return;
    }

    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401) {
        console.error("Authentication failed - token may be expired");
        showError("Authentication expired. Please login again.");
        setTimeout(() => {
          logout();
        }, 2000);
        return;
      }

      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Properties loaded:", data);

    properties = data || [];
    renderProperties(properties);

    // Only show success message if properties are loaded
    if (properties.length > 0) {
      showSuccess(`${properties.length} properties loaded successfully`);
    } else {
      console.log("No properties found");
    }
  } catch (error) {
    console.error("Error loading properties:", error);

    // More specific error messages
    if (error.name === "AbortError") {
      showError("Request timed out. Please check your internet connection.");
    } else if (error.message.includes("fetch")) {
      showError(
        "Cannot connect to server. Please ensure the backend is running on port 3000."
      );
    } else if (error.message.includes("NetworkError")) {
      showError("Network error. Please check your internet connection.");
    } else if (
      error.message.includes("Authentication") ||
      error.message.includes("token")
    ) {
      showError("Authentication error. Please login again.");
      setTimeout(() => {
        logout();
      }, 2000);
    } else {
      showError(`Failed to load properties: ${error.message}`);
    }

    // Show empty state even if there's an error
    renderProperties([]);
  } finally {
    showLoading(false);
  }
}
