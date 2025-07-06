// Load properties owned by the manager
async function loadProperties() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/properties?managerId=${managerId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load properties");
    }

    properties = await response.json();
    populatePropertySelect();
  } catch (error) {
    console.error("Error loading properties:", error);
    showNotification("Failed to load properties", "error");
  }
}
