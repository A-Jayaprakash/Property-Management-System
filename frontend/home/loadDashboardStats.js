// Dashboard data loading
async function loadDashboardStats() {
  try {
    showLoading();

    // Load properties
    const propertiesResponse = await fetch("/api/properties", {
      headers: getAuthHeaders(),
    });

    if (propertiesResponse.ok) {
      const properties = await propertiesResponse.json();
      dashboardData.properties = properties.length;

      // Count total units
      dashboardData.units = properties.reduce((total, property) => {
        return (
          total +
          (property.units ? property.units.length : property.unitCount || 0)
        );
      }, 0);
    }

    // Load tenants
    const tenantsResponse = await fetch("/api/tenants", {
      headers: getAuthHeaders(),
    });

    if (tenantsResponse.ok) {
      const tenants = await tenantsResponse.json();
      dashboardData.tenants = tenants.filter(
        (tenant) => tenant.status === "active"
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
