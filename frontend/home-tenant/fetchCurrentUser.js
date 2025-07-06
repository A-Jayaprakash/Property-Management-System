async function fetchCurrentUser() {
  try {
    console.log("=== DEBUG fetchCurrentUser ===");

    const token = getAuthToken();
    console.log("Token:", token ? token.substring(0, 20) + "..." : "No token");

    if (!token) {
      console.log("No token found, redirecting to login");
      logout();
      return;
    }

    console.log("Making request to /api/auth");
    const response = await fetch("http://localhost:3000/api/auth", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (response.ok) {
      const userData = await response.json();
      console.log("User data received:", userData);

      currentUser = userData;
      console.log("currentUser set to:", currentUser);

      updateUserDisplay();
      console.log("updateUserDisplay called");
    } else if (response.status === 401) {
      console.log("Unauthorized - token expired or invalid");
      const errorData = await response.json();
      console.log("Error response:", errorData);
      logout();
      return;
    } else {
      console.log("Other error status:", response.status);
      const errorData = await response.json();
      console.log("Error response:", errorData);
    }
  } catch (error) {
    console.error("Error in fetchCurrentUser:", error);
    console.error("Error stack:", error.stack);
  }
}
