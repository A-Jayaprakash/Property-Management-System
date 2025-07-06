function updateStats() {
  const totalProperties = allProperties.length;
  const totalAvailableUnits = allUnits.filter(
    (unit) => unit.status === "available"
  ).length;

  // Calculate average rent from available units
  const availableUnits = allUnits.filter(
    (unit) => unit.status === "available" && unit.rent
  );
  const avgRent =
    availableUnits.length > 0
      ? Math.round(
          availableUnits.reduce((sum, unit) => sum + unit.rent, 0) /
            availableUnits.length
        )
      : 0;

  document.getElementById("totalProperties").textContent = totalProperties;
  document.getElementById("availableUnits").textContent = totalAvailableUnits;
  document.getElementById("avgRent").textContent =
    avgRent > 0 ? `$${avgRent.toLocaleString()}` : "N/A";
}
