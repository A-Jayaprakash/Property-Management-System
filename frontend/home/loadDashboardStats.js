// Dashboard data loading
async function loadDashboardStats() {
  console.log("Loading dashboard stats...");
  try {
    showLoading();

    // Load properties
    const propertiesResponse = await fetch(`${API_BASE_URL}/api/properties`, {
      headers: getAuthHeaders(),
    });
    const unitsResponse = await fetch(
      `${API_BASE_URL}/api/units/stats`,
      { headers: getAuthHeaders() }
    );

    if (propertiesResponse.ok) {
      const properties = await propertiesResponse.json();
      dashboardData.properties = properties.length;

      // Count total units from property unitCount fields as fallback
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
      dashboardData.units = unitsData.total_units ?? dashboardData.units;
    }

    // Load tenants
    const tenantsResponse = await fetch(`${API_BASE_URL}/api/tenants`, {
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
    console.error("Failed to load dashboard statistics");
  }
}
