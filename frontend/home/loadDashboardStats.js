// Dashboard data loading
async function loadDashboardStats() {
  console.log("Loading dashboard stats...");
  try {
    showLoading();

    // Load properties
    const propertiesResponse = await fetch(
      "http://localhost:3000/api/properties",
      {
        headers: getAuthHeaders(),
      }
    );
    const unitsResponse = await fetch("http://localhost:3000/api/units", {
      headers: getAuthHeaders(),
    });

    if (propertiesResponse.ok) {
      const properties = await propertiesResponse.json();
      dashboardData.properties = properties.length;

      // Count total units
      dashboardData.units = properties.reduce((total, property) => {
        if (Array.isArray(property.units)) {
          return total + property.units.length;
        } else if (typeof property.unitCount === "number") {
          return total + property.unitCount;
        } else {
          return total;
        }
      }, 0);
    }

    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json();
      console.log(unitsData);
      dashboardData.units = Array.isArray(unitsData.units)
        ? unitsData.units.length
        : 0;
    }

    // Load tenants
    const tenantsResponse = await fetch("http://localhost:3000/api/tenants", {
      headers: getAuthHeaders(),
    });

    if (tenantsResponse.ok) {
      const tenants = await tenantsResponse.json();
      const data = tenants.data;
      dashboardData.tenants = data.filter(
        (tenant) => tenant.status === "Active"
      ).length;
    }

    // Calculate occupancy rate
    if (dashboardData.units > 0) {
      dashboardData.occupancyRate = Math.round(
        (dashboardData.tenants / dashboardData.units) * 100
      );
    }

    updateStatsDisplay();
    hideLoading();
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    hideLoading();
    showError("Failed to load dashboard statistics");
  }
}
