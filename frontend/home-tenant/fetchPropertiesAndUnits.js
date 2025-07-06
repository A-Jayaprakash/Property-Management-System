// Fetch properties and units
async function fetchPropertiesAndUnits() {
  try {
    document.getElementById("loadingSpinner").style.display = "block";
    document.getElementById("propertiesGrid").style.display = "none";
    document.getElementById("noPropertiesMessage").style.display = "none";

    const headers = getAuthHeaders();

    // Fetch properties
    const propertiesResponse = await fetch("/api/properties", {
      method: "GET",
      headers: headers,
    });

    if (!propertiesResponse.ok) {
      if (propertiesResponse.status === 401) {
        logout();
        return;
      }
      throw new Error(
        `Failed to fetch properties: ${propertiesResponse.status}`
      );
    }

    const propertiesData = await propertiesResponse.json();
    allProperties = Array.isArray(propertiesData) ? propertiesData : [];

    // Fetch units
    try {
      const unitsResponse = await fetch("/api/units", {
        method: "GET",
        headers: headers,
      });

      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        allUnits = Array.isArray(unitsData) ? unitsData : [];
      } else {
        console.log("Units endpoint not available, showing properties only");
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
    updateStats();
    renderProperties(filteredProperties);
  } catch (error) {
    console.error("Error fetching data:", error);
    showErrorMessage(
      "Failed to load properties and units. Please try again later."
    );
  } finally {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("propertiesGrid").style.display = "grid";
  }
}
