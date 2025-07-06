// Save tenant
async function saveTenant(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const tenantData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phoneNumber: document.getElementById("phoneNumber").value,
    assignedUnit: document.getElementById("assignedUnit").value,
    status: document.getElementById("status").value,
    leaseStartDate: document.getElementById("leaseStartDate").value,
    leaseEndDate: document.getElementById("leaseEndDate").value,
    monthlyRent: parseFloat(document.getElementById("monthlyRent").value) || 0,
    securityDeposit:
      parseFloat(document.getElementById("securityDeposit").value) || 0,
    emergencyName: document.getElementById("emergencyName").value,
    emergencyPhone: document.getElementById("emergencyPhone").value,
    emergencyRelationship: document.getElementById("emergencyRelationship")
      .value,
    notes: document.getElementById("notes").value,
    managerId: managerId,
  };

  try {
    let response;
    if (editingTenant) {
      response = await fetch(`/api/tenants/${editingTenant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(tenantData),
      });
    } else {
      response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(tenantData),
      });
    }

    if (!response.ok) {
      throw new Error("Failed to save tenant");
    }

    const savedTenant = await response.json();

    if (editingTenant) {
      const index = tenants.findIndex((t) => t.id === editingTenant.id);
      tenants[index] = savedTenant;
      showNotification("Tenant updated successfully", "success");
    } else {
      tenants.push(savedTenant);
      showNotification("Tenant added successfully", "success");
    }

    // Update unit status to occupied
    await updateUnitStatus(tenantData.assignedUnit, "occupied");

    closeModal();
    filteredTenants = [...tenants];
    renderTenants();
    updateStats();
  } catch (error) {
    console.error("Error saving tenant:", error);
    showNotification("Failed to save tenant", "error");
  }
}
