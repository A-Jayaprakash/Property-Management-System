// Update statistics display
function updateStatsDisplay(stats) {
  document.getElementById("totalUnits").textContent = stats.total_units || 0;
  document.getElementById("availableUnits").textContent =
    stats.available_units || 0;
  document.getElementById("occupiedUnits").textContent =
    stats.occupied_units || 0;
  document.getElementById("maintenanceUnits").textContent =
    stats.maintenance_units || 0;
  document.getElementById("occupancyRate").textContent = `${
    stats.occupancy_rate || 0
  }%`;
  document.getElementById("avgRent").textContent = `₹${(
    stats.avg_rent || 0
  ).toLocaleString()}`;
}
