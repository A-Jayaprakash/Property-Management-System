async function deleteProperty(propertyId, propertyName) {
  if (!propertyId) {
    showError("Invalid property ID");
    return;
  }

  // Check if user has permission to delete properties
  const userRole = window.userData?.user?.role || "tenant";
  const currentUserId = window.userData?.user?.id;

  if (userRole === "tenant") {
    showError("Access denied: Only admin and manager can delete properties");
    return;
  }

  // Find the property to check ownership
  const property = properties.find((p) => p._id === propertyId);
  if (!property) {
    showError("Property not found");
    return;
  }

  if (userRole === "manager" && property.createdBy !== currentUserId) {
    showError("Access denied: You can only delete properties you created");
    return;
  }

  // Confirm deletion
  if (
    !confirm(
      `Are you sure you want to delete "${propertyName}"? This action cannot be undone.`
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

      if (response.status === 403) {
        const errorData = await response.json();
        showError(errorData.message || "Access denied");
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
