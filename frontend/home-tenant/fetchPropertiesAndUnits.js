// Fetch properties and units with improved error handling
async function fetchPropertiesAndUnits() {
  try {
    document.getElementById("loadingSpinner").style.display = "block";
    document.getElementById("propertiesGrid").style.display = "none";
    document.getElementById("noPropertiesMessage").style.display = "none";

    const headers = getAuthHeaders();
    console.log("Auth headers:", headers);

    // Check if we have a valid token
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      logout();
      return;
    }

    console.log("Fetching properties...");

    // Fetch properties
    const propertiesResponse = await fetch("/api/properties", {
      method: "GET",
      headers: headers,
    });

    console.log("Properties response status:", propertiesResponse.status);
    console.log("Properties response headers:", propertiesResponse.headers);

    if (!propertiesResponse.ok) {
      if (propertiesResponse.status === 401) {
        console.error("Authentication failed - redirecting to login");
        logout();
        return;
      }

      const errorText = await propertiesResponse.text();
      console.error("Properties fetch error:", errorText);
      throw new Error(
        `Failed to fetch properties: ${propertiesResponse.status} - ${errorText}`
      );
    }

    const propertiesData = await propertiesResponse.json();
    console.log("Properties data received:", propertiesData);
    allProperties = Array.isArray(propertiesData) ? propertiesData : [];

    // Fetch units
    try {
      console.log("Fetching units...");
      const unitsResponse = await fetch("/api/units", {
        method: "GET",
        headers: headers,
      });

      console.log("Units response status:", unitsResponse.status);

      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        console.log("Units data received:", unitsData);
        allUnits = Array.isArray(unitsData) ? unitsData : [];
      } else {
        console.log(
          "Units endpoint not available or error:",
          unitsResponse.status
        );
        allUnits = [];
      }
    } catch (error) {
      console.log("Error fetching units:", error);
      allUnits = [];
    }

    // Combine properties with their units
    const propertiesWithUnits = allProperties.map((property) => {
      const propertyUnits = allUnits.filter(
        (unit) =>
          unit.propertyId === property._id || unit.property === property._id
      );
      return {
        ...property,
        units: propertyUnits,
        availableUnits: propertyUnits.filter(
          (unit) => unit.status === "available"
        ).length,
        totalUnits: propertyUnits.length || property.unitCount || 0,
      };
    });

    filteredProperties = propertiesWithUnits;
    console.log("Final filtered properties:", filteredProperties);

    updateStats();
    renderProperties(filteredProperties);
  } catch (error) {
    console.error("Error fetching data:", error);
    showErrorMessage(
      `Failed to load properties and units. Error: ${error.message}`
    );
  } finally {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("propertiesGrid").style.display = "grid";
  }
}
