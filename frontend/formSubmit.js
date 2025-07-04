async function handleFormSubmit() {
  const formData = new FormData(document.getElementById("propertyForm"));
  const propertyData = {
    name: formData.get("name"),
    address: formData.get("address"),
    locality: formData.get("locality"),
    type: formData.get("type"),
    unitCount: parseInt(formData.get("unitCount")),
  };

  // Validate form data
  if (
    !propertyData.name ||
    !propertyData.address ||
    !propertyData.type ||
    !propertyData.unitCount
  ) {
    showError("Please fill in all required fields.");
    return;
  }

  if (propertyData.unitCount <= 0) {
    showError("Unit count must be a positive number.");
    return;
  }

  try {
    // Check authentication before making request
    if (!isAuthenticated || !authToken) {
      showError("Authentication required. Please login again.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return;
    }

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = currentEditId ? "Updating..." : "Creating...";
    }

    let response;
    if (currentEditId) {
      console.log("Updating property:", currentEditId, propertyData);
      response = await fetch(`${API_BASE_URL}/${currentEditId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(propertyData),
      });
    } else {
      console.log("Creating new property:", propertyData);
      response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(propertyData),
      });
    }

    console.log("Form submit response status:", response.status);

    if (!response.ok) {
      // Handle authentication errors
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
    console.log("Property saved successfully:", result);

    closeModal();
    await loadProperties(); // Reload properties after successful save
    showSuccess(
      currentEditId
        ? "Property updated successfully!"
        : "Property created successfully!"
    );

    // Reset form state
    currentEditId = null;
  } catch (error) {
    console.error("Error saving property:", error);

    if (
      error.message.includes("Authentication") ||
      error.message.includes("token")
    ) {
      showError("Authentication error. Please login again.");
      setTimeout(() => {
        logout();
      }, 2000);
    } else if (error.message.includes("Network")) {
      showError("Network error. Please check your internet connection.");
    } else {
      showError(`Failed to save property: ${error.message}`);
    }
  } finally {
    // Re-enable submit button
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = currentEditId
        ? "Update Property"
        : "Save Property";
    }
  }
}
