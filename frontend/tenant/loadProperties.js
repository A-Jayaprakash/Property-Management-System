async function loadProperties() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    // Save to global array
    properties = data;

    // Now populate dropdown
    populatePropertySelect();
  } catch (error) {
    console.error("Failed to load properties:", error);
    showNotification("Failed to load properties", "error");
  }
}
