// Populate form with tenant data
function populateForm(tenant) {
  document.getElementById("fullName").value = tenant.fullName;
  document.getElementById("email").value = tenant.email;
  document.getElementById("phoneNumber").value = tenant.phoneNumber;
  document.getElementById("assignedUnit").value = tenant.assignedUnit;
  document.getElementById("status").value = tenant.status;
  document.getElementById("leaseStartDate").value = tenant.leaseStartDate;
  document.getElementById("leaseEndDate").value = tenant.leaseEndDate;
  document.getElementById("monthlyRent").value = tenant.monthlyRent || "";
  document.getElementById("securityDeposit").value =
    tenant.securityDeposit || "";
  document.getElementById("emergencyName").value = tenant.emergencyName || "";
  document.getElementById("emergencyPhone").value = tenant.emergencyPhone || "";
  document.getElementById("emergencyRelationship").value =
    tenant.emergencyRelationship || "";
  document.getElementById("notes").value = tenant.notes || "";

  // Set property based on unit
  const unitData = units.find((u) => u.id === tenant.assignedUnit);
  if (unitData) {
    document.getElementById("propertySelect").value = unitData.propertyId;
    loadUnitsForProperty().then(() => {
      document.getElementById("assignedUnit").value = tenant.assignedUnit;
    });
  }
}
