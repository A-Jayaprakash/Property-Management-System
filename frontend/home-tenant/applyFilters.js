function applyFilters() {
  const propertyType = document.getElementById("propertyType").value;
  const locality = document.getElementById("locality").value.toLowerCase();
  const minUnits = parseInt(document.getElementById("minUnits").value) || 0;
  const maxUnits =
    parseInt(document.getElementById("maxUnits").value) || Infinity;

  filteredProperties = allProperties
    .map((property) => {
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
    })
    .filter((property) => {
      const matchesType = !propertyType || property.type === propertyType;
      const matchesLocality =
        !locality ||
        property.locality.toLowerCase().includes(locality) ||
        property.address.toLowerCase().includes(locality);
      const matchesUnits =
        property.totalUnits >= minUnits && property.totalUnits <= maxUnits;

      return matchesType && matchesLocality && matchesUnits;
    });

  renderProperties(filteredProperties);
}
