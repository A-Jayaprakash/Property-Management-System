// Delete tenant
async function deleteTenant(tenantId) {
  if (
    !confirm(
      "Are you sure you want to remove this tenant? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const tenant = tenants.find((t) => t.id === tenantId);

    const response = await fetch(`/api/tenants/${tenantId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete tenant");
    }

    // Update unit status to available
    if (tenant) {
      await updateUnitStatus(tenant.assignedUnit, "available");
    }

    tenants = tenants.filter((t) => t.id !== tenantId);
    filteredTenants = filteredTenants.filter((t) => t.id !== tenantId);

    renderTenants();
    updateStats();
    showNotification("Tenant removed successfully", "success");
  } catch (error) {
    console.error("Error deleting tenant:", error);
    showNotification("Failed to remove tenant", "error");
  }
}
