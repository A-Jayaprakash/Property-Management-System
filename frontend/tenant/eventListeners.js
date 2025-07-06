// Setup event listeners
function setupEventListeners() {
  // Search functionality
  document
    .getElementById("searchInput")
    .addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      filteredTenants = tenants.filter(
        (tenant) =>
          tenant.fullName.toLowerCase().includes(searchTerm) ||
          tenant.email.toLowerCase().includes(searchTerm) ||
          tenant.assignedUnit.toLowerCase().includes(searchTerm)
      );
      currentPage = 1;
      renderTenants();
    });

  // Status filter
  document
    .getElementById("statusFilter")
    .addEventListener("change", function (e) {
      const status = e.target.value;
      if (status) {
        filteredTenants = tenants.filter((tenant) => tenant.status === status);
      } else {
        filteredTenants = [...tenants];
      }
      currentPage = 1;
      renderTenants();
    });

  // Sort functionality
  document.getElementById("sortBy").addEventListener("change", function (e) {
    const sortBy = e.target.value;
    filteredTenants.sort((a, b) => {
      if (sortBy === "fullName") {
        return a.fullName.localeCompare(b.fullName);
      } else if (sortBy === "leaseEndDate") {
        return new Date(a.leaseEndDate) - new Date(b.leaseEndDate);
      } else if (sortBy === "assignedUnit") {
        return a.assignedUnit.localeCompare(b.assignedUnit);
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    renderTenants();
  });

  // Form submission
  document.getElementById("tenantForm").addEventListener("submit", saveTenant);

  // Close modal on outside click
  document
    .getElementById("tenantModal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal();
      }
    });
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    openModal("addTenant");
  }
});
