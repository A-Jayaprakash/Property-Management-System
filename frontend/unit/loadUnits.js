// Load units - Fully dynamic from database
async function loadUnits(page = 1) {
  const loadingIndicator = document.getElementById("loadingIndicator");
  const unitsGrid = document.getElementById("unitsGrid");

  // Show loading indicator
  loadingIndicator.style.display = "block";
  unitsGrid.innerHTML = "";

  try {
    console.log(`Loading units from database (page ${page})...`);

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: "12",
    });

    // Add filters if they exist
    const filters = getActiveFilters();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    // Make API request
    const data = await apiRequest(`/units?${queryParams}`);
    console.log(data);
    // Process response
    if (data.units && Array.isArray(data.units)) {
      units = data.units;
      console.log(`Loaded ${units.length} units from database`);

      // Update pagination info
      if (data.pagination) {
        currentPage = data.pagination.current_page || 1;
        totalPages = data.pagination.total_pages || 1;

        console.log(`Pagination: ${currentPage}/${totalPages}`);
      } else {
        currentPage = 1;
        totalPages = 1;
      }

      // Display units and update pagination

      displayUnits();
      updatePagination();

      // Show success message if no units found
      if (units.length === 0) {
        showEmptyState();
      }
    } else {
      console.warn("No units found in database response");
      units = [];
      showEmptyState();
    }
  } catch (error) {
    console.error("Error loading units:", error);

    // Handle different types of errors
    let errorMessage = "Failed to load units. Please try again.";

    if (error.message.includes("Authentication failed")) {
      errorMessage = "Session expired. Please login again.";
    } else if (error.message.includes("Network")) {
      errorMessage = "Network error. Please check your connection.";
    }

    // Show error notification
    showNotification(errorMessage, "error");

    // Set empty units array
    units = [];
    showEmptyState();
  } finally {
    // Hide loading indicator
    loadingIndicator.style.display = "none";
  }
}

// Get active filters from form
function getActiveFilters() {
  const filters = {};

  const propertyFilter = document.getElementById("propertyFilter")?.value;
  const statusFilter = document.getElementById("statusFilter")?.value;
  const typeFilter = document.getElementById("typeFilter")?.value;
  const minRentFilter = document.getElementById("minRentFilter")?.value;
  const maxRentFilter = document.getElementById("maxRentFilter")?.value;
  const searchInput = document.getElementById("searchInput")?.value;

  if (propertyFilter) filters.property = propertyFilter;
  if (statusFilter) filters.status = statusFilter;
  if (typeFilter) filters.type = typeFilter;
  if (minRentFilter) filters.min_rent = minRentFilter;
  if (maxRentFilter) filters.max_rent = maxRentFilter;
  if (searchInput) filters.search = searchInput;

  return filters;
}

// Show empty state when no units are found
function showEmptyState() {
  const unitsGrid = document.getElementById("unitsGrid");

  const emptyStateHTML = `
    <div class="empty-state" style="
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: #666;
    ">
      <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;">
        🏢
      </div>
      <h3 style="margin-bottom: 10px; color: #333;">No Units Found</h3>
      <p style="margin-bottom: 20px;">
        ${
          getActiveFilters().search ||
          Object.keys(getActiveFilters()).length > 0
            ? "No units match your current filters. Try adjusting your search criteria."
            : "No units have been added yet. Start by adding your first unit."
        }
      </p>
      <button class="btn btn-primary" onclick="clearFilters(); openAddUnitModal();" style="
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      ">
        <i class="fas fa-plus"></i> Add New Unit
      </button>
    </div>
  `;

  unitsGrid.innerHTML = emptyStateHTML;

  // Update pagination for empty state
  currentPage = 1;
  totalPages = 1;
  updatePagination();
}
