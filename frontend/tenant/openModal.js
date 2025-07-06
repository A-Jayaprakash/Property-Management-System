// Open modal
function openModal(mode, tenantId = null) {
  const modal = document.getElementById("tenantModal");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("tenantForm");

  if (mode === "addTenant") {
    modalTitle.textContent = "Add New Tenant";
    form.reset();
    editingTenant = null;
    // Set default dates
    const today = new Date();
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    document.getElementById("leaseStartDate").value = today
      .toISOString()
      .split("T")[0];
    document.getElementById("leaseEndDate").value = oneYearLater
      .toISOString()
      .split("T")[0];
  } else if (mode === "editTenant") {
    modalTitle.textContent = "Edit Tenant";
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant) {
      populateForm(tenant);
      editingTenant = tenant;
    }
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}
