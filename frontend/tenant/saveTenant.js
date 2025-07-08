// Save tenant with improved debugging
async function saveTenant(e) {
  e.preventDefault();

  const assignedUnitSelect = document.getElementById("assignedUnit");
  const selectedOption =
    assignedUnitSelect.options[assignedUnitSelect.selectedIndex];

  // Debug unit selection
  console.log("Selected option:", selectedOption);
  console.log("Selected option value:", selectedOption?.value);
  console.log("Selected option dataset:", selectedOption?.dataset);
  console.log("Unit ID from dataset:", selectedOption?.dataset?.unitId);

  const tenantData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phoneNumber: document.getElementById("phoneNumber").value,
    assignedUnit: document.getElementById("assignedUnit").value,
    unitId: selectedOption ? selectedOption.dataset.unitId : null,
    status: document.getElementById("status").value,
    leaseStartDate: document.getElementById("leaseStartDate").value,
    leaseEndDate: document.getElementById("leaseEndDate").value,
    propertyId: document.getElementById("propertySelect").value,
    monthlyRent: parseFloat(document.getElementById("monthlyRent").value) || 0,
    securityDeposit:
      parseFloat(document.getElementById("securityDeposit").value) || 0,
    notes: document.getElementById("notes").value,
    managerId: managerId,
  };

  // Enhanced validation
  if (!tenantData.unitId) {
    showNotification("Please select a valid unit", "error");
    return;
  }

  // Validate MongoDB ObjectId format
  if (!/^[0-9a-fA-F]{24}$/.test(tenantData.unitId)) {
    showNotification(`Invalid unit ID format: ${tenantData.unitId}`, "error");
    console.error("Invalid unit ID format:", tenantData.unitId);
    return;
  }

  console.log("Tenant data being sent:", tenantData);

  try {
    let response;
    if (editingTenant) {
      const tenantId = editingTenant._id || editingTenant.id;
      response = await fetch(`http://localhost:3000/api/tenants/${tenantId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(tenantData),
      });
    } else {
      response = await fetch("http://localhost:3000/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(tenantData),
      });
      console.log("Final JSON:", JSON.stringify(tenantData));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Server response:", errorData);
      throw new Error(errorData?.message || "Failed to save tenant");
    }

    const responseData = await response.json();
    console.log("Server response:", responseData);

    const savedTenant = responseData.data || responseData;
    console.log("Saved tenant data:", savedTenant);

    if (editingTenant) {
      const tenantId = editingTenant._id || editingTenant.id;
      const index = tenants.findIndex((t) => (t._id || t.id) === tenantId);
      if (index !== -1) {
        tenants[index] = savedTenant;
      }
      showNotification("Tenant updated successfully", "success");
    } else {
      tenants.push(savedTenant);
      showNotification("Tenant added successfully", "success");
    }

    // Update unit status to occupied - but only if tenant status is Active
    if (tenantData.status === "Active" && tenantData.unitId) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await updateUnitStatus(tenantData.unitId, "occupied");
        console.log("Unit status updated to occupied");
      } catch (unitError) {
        console.warn("Failed to update unit status:", unitError.message);
        showNotification(
          "Tenant saved successfully, but unit status could not be updated. Please update manually if needed.",
          "warning"
        );
      }
    }

    closeModal();
    filteredTenants = [...tenants];
    renderTenants();
    updateStats();
  } catch (error) {
    console.error("Error saving tenant:", error);
    showNotification(error.message || "Failed to save tenant", "error");
  }
}
