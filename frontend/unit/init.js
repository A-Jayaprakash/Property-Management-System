// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  loadProperties();
  loadUnits();
  loadStats();

  // Set up search functionality
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", debounce(handleSearch, 500));
});
