// Clear filters
function clearFilters() {
  document.getElementById("propertyFilter").value = "";
  document.getElementById("statusFilter").value = "";
  document.getElementById("typeFilter").value = "";
  document.getElementById("minRentFilter").value = "";
  document.getElementById("maxRentFilter").value = "";
  document.getElementById("searchInput").value = "";

  currentPage = 1;
  loadUnits(1);
}
