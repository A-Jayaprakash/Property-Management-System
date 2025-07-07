// Populate form with tenant data
async function populateForm(tenant) {
  // Basic tenant information
  document.getElementById("fullName").value = tenant.fullName || "";
  document.getElementById("email").value = tenant.email || "";
  document.getElementById("phoneNumber").value = tenant.phoneNumber || "";
  document.getElementById("status").value = tenant.status || "Active";

  // Format dates for input fields
  if (tenant.leaseStartDate) {
    const startDate = new Date(tenant.leaseStartDate);
    document.getElementById("leaseStartDate").value = startDate
      .toISOString()
      .split("T")[0];
  }

  if (tenant.leaseEndDate) {
    const endDate = new Date(tenant.leaseEndDate);
    document.getElementById("leaseEndDate").value = endDate
      .toISOString()
      .split("T")[0];
  }

  // Financial information
  document.getElementById("monthlyRent").value = tenant.monthlyRent || "";
  document.getElementById("securityDeposit").value =
    tenant.securityDeposit || "";

  // Notes
  document.getElementById("notes").value = tenant.notes || "";

  // Set property and unit
  if (tenant.propertyId) {
    document.getElementById("propertySelect").value = tenant.propertyId;

    // Load units for the property and then set the assigned unit
    try {
      await loadUnitsForProperty();

      // Set the assigned unit after units are loaded
      if (tenant.assignedUnit) {
        document.getElementById("assignedUnit").value = tenant.assignedUnit;
      }
    } catch (error) {
      console.error("Error loading units for property:", error);
    }
  }
}
