// Initialize the application
document.addEventListener("DOMContentLoaded", async function () {
  await loadUnitAmenities(); // populate checkboxes from API before anything else
  loadProperties();
  loadUnits();
  loadStats();

  // Set up search functionality
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", debounce(handleSearch, 500));
});
