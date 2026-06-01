async function deleteTenant(tenantId) {
  if (
    !confirm(
      "Are you sure you want to remove this tenant? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const tenant = tenants.find((t) => (t._id || t.id) === tenantId);
    if (!tenant) throw new Error("Tenant not found");

    // Resolve the unitId regardless of whether it is populated or a plain string
    const rawUnitId = tenant.unitId;
    const unitId =
      rawUnitId && typeof rawUnitId === "object"
        ? rawUnitId._id || rawUnitId.id
        : rawUnitId;

    // Delete the tenant first
    const response = await fetch(`${API_BASE_URL}/api/tenants/${tenantId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.message || "Failed to delete tenant");
    }

    // Free the unit now that the tenant record is gone
    if (unitId) {
      const unitRes = await fetch(
        `${API_BASE_URL}/api/units/${unitId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: "available" }),
        }
      );

      if (!unitRes.ok) {
        const unitErr = await unitRes.json().catch(() => null);
        // Non-fatal — tenant is already deleted; warn the user
        showNotification(
          `Tenant deleted, but unit status could not be updated: ${
            unitErr?.message || "unknown error"
          }. Please update it manually from the Unit page.`,
          "warning"
        );
      }
    }

    // Update local state
    tenants = tenants.filter((t) => (t._id || t.id) !== tenantId);
    filteredTenants = filteredTenants.filter(
      (t) => (t._id || t.id) !== tenantId
    );

    renderTenants();
    updateStats();
    showNotification("Tenant removed and unit marked as available", "success");
  } catch (error) {
    console.error("Error deleting tenant:", error);
    showNotification(error.message || "Failed to remove tenant", "error");
  }
}
