// Deactivate tenant — keeps profile for auditing, frees the unit
async function deleteTenant(tenantId) {
  const tenant = tenants.find((t) => (t._id || t.id) === tenantId);
  if (!tenant) return;

  if (tenant.status === "Inactive") {
    showNotification("This tenant is already inactive.", "warning");
    return;
  }

  if (
    !confirm(
      `Deactivate ${tenant.fullName}?\n\nTheir profile will be kept as Inactive for auditing, and their unit will be marked as available.`
    )
  ) {
    return;
  }

  try {
    // Resolve unitId (populated object or plain string)
    const rawUnitId = tenant.unitId;
    const unitId =
      rawUnitId && typeof rawUnitId === "object"
        ? rawUnitId._id || rawUnitId.id
        : rawUnitId;

    // Call the deactivate endpoint
    const response = await fetch(
      `${API_BASE_URL}/api/tenants/${tenantId}/deactivate`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.message || "Failed to deactivate tenant");
    }

    // Free the unit
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
        showNotification(
          `Tenant deactivated, but unit status could not be updated: ${
            unitErr?.message || "unknown error"
          }. Update it manually from the Unit page.`,
          "warning"
        );
      }
    }

    // Update local state — mark as Inactive instead of removing
    const index = tenants.findIndex((t) => (t._id || t.id) === tenantId);
    if (index !== -1) tenants[index] = { ...tenants[index], status: "Inactive" };
    filteredTenants = [...tenants];

    renderTenants();
    updateStats();
    showNotification(
      `${tenant.fullName} has been deactivated. Profile retained for auditing.`,
      "success"
    );
  } catch (error) {
    console.error("Error deactivating tenant:", error);
    showNotification(error.message || "Failed to deactivate tenant", "error");
  }
}
