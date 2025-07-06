function clearFilters() {
  document.getElementById("propertyType").value = "";
  document.getElementById("locality").value = "";
  document.getElementById("minUnits").value = "";
  document.getElementById("maxUnits").value = "";

  filteredProperties = allProperties.map((property) => {
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

  renderProperties(filteredProperties);
}
