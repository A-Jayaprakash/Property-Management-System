// Delete tenant - FIXED VERSION
async function deleteTenant(tenantId) {
  if (
    !confirm(
      "Are you sure you want to remove this tenant? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    // Find tenant using both possible ID formats
    const tenant = tenants.find((t) => (t._id || t.id) === tenantId);

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    console.log("Tenant found:", tenant);
    console.log("Tenant unitId:", tenant.unitId);

    const response = await fetch(
      `http://localhost:3000/api/tenants/${tenantId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete tenant");
    }

    // Update unit status to available - only if unitId exists and is valid
    if (tenant.unitId) {
      try {
        await updateUnitStatus(tenant.unitId._id, "available");
        console.log("Unit status updated to available");
      } catch (unitError) {
        console.warn("Failed to update unit status:", unitError.message);
        // Continue with tenant deletion even if unit update fails
      }
    } else {
      console.warn("No unitId found for tenant, skipping unit status update");
    }

    // Remove tenant from arrays using the same ID matching logic
    tenants = tenants.filter((t) => (t._id || t.id) !== tenantId);
    filteredTenants = filteredTenants.filter(
      (t) => (t._id || t.id) !== tenantId
    );

    renderTenants();
    updateStats();
    showNotification("Tenant removed successfully", "success");
  } catch (error) {
    console.error("Error deleting tenant:", error);
    showNotification("Failed to remove tenant", "error");
  }
}
