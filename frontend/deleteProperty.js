async function deleteProperty(propertyId) {
  if (!propertyId) {
    showError("Invalid property ID");
    return;
  }

  // Confirm deletion
  if (
    !confirm(
      "Are you sure you want to delete this property? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    // Check authentication
    if (!isAuthenticated || !authToken) {
      showError("Authentication required. Please login again.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return;
    }

    showLoading(true);
    console.log("Deleting property:", propertyId);

    const response = await fetch(`${API_BASE_URL}/${propertyId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        showError("Authentication expired. Please login again.");
        setTimeout(() => {
          logout();
        }, 2000);
        return;
      }

      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error occurred" }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("Property deleted successfully:", result);

    await loadProperties(); // Reload properties after successful deletion
    showSuccess("Property deleted successfully!");
  } catch (error) {
    console.error("Error deleting property:", error);

    if (
      error.message.includes("Authentication") ||
      error.message.includes("token")
    ) {
      showError("Authentication error. Please login again.");
      setTimeout(() => {
        logout();
      }, 2000);
    } else {
      showError(`Failed to delete property: ${error.message}`);
    }
  } finally {
    showLoading(false);
  }
}
