// Load units
async function loadUnits(page = 1) {
  const loadingIndicator = document.getElementById("loadingIndicator");
  const unitsGrid = document.getElementById("unitsGrid");

  loadingIndicator.style.display = "block";
  unitsGrid.innerHTML = "";

  try {
    const queryParams = new URLSearchParams({
      page: page,
      limit: 12,
    });

    // Add filters
    const propertyFilter = document.getElementById("propertyFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;
    const typeFilter = document.getElementById("typeFilter").value;
    const minRentFilter = document.getElementById("minRentFilter").value;
    const maxRentFilter = document.getElementById("maxRentFilter").value;

    if (propertyFilter) queryParams.append("property", propertyFilter);
    if (statusFilter) queryParams.append("status", statusFilter);
    if (typeFilter) queryParams.append("type", typeFilter);
    if (minRentFilter) queryParams.append("min_rent", minRentFilter);
    if (maxRentFilter) queryParams.append("max_rent", maxRentFilter);

    const response = await fetch(`${API_BASE_URL}/units?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      units = data.units || [];
      currentPage = data.pagination?.current_page || 1;
      totalPages = data.pagination?.total_pages || 1;

      displayUnits();
      updatePagination();
    } else {
      throw new Error("Failed to load units");
    }
  } catch (error) {
    console.error("Error loading units:", error);
    // Use mock data for demo
    generateMockUnits();
    displayUnits();
  } finally {
    loadingIndicator.style.display = "none";
  }
}
