function updateStatsDisplay() {
  document.getElementById("totalProperties").textContent =
    dashboardData.properties;
  document.getElementById("totalUnits").textContent = dashboardData.units;
  document.getElementById("activeTenants").textContent = dashboardData.tenants;
  document.getElementById(
    "occupancyRate"
  ).textContent = `${dashboardData.occupancyRate}%`;
}
