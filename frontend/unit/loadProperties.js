// Load properties for dropdowns
async function loadProperties() {
  try {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      properties = data.properties || [];
      populatePropertyDropdowns();
    }
  } catch (error) {
    console.error("Error loading properties:", error);
    // Use mock data for demo
    properties = [
      { _id: "1", name: "Sunrise Apartments", address: "123 Main St" },
      { _id: "2", name: "Downtown Plaza", address: "456 Oak Ave" },
      { _id: "3", name: "Garden View Complex", address: "789 Pine Rd" },
    ];
    populatePropertyDropdowns();
  }
}
