// Relocate tenant using the dedicated PATCH /relocate endpoint
async function relocateTenant(tenantId) {
  const tenant = tenants.find((t) => (t._id || t.id) === tenantId);
  if (!tenant) return;

  const newUnit = prompt("Enter new unit number:", tenant.assignedUnit);
  if (!newUnit || newUnit === tenant.assignedUnit) return;

  // Ask for the new unit's ObjectId (looked up from the units list if available)
  // We need the unitId for the backend. Try to find it from global units or prompt.
  let newUnitId = null;
  if (typeof units !== "undefined" && Array.isArray(units)) {
    const matched = units.find((u) => u.unit_number === newUnit);
    if (matched) newUnitId = matched._id || matched.id;
  }

  if (!newUnitId) {
    showNotification(
      "Unit not found in current list. Please load units first or use the Edit form to relocate.",
      "error"
    );
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tenants/${tenantId}/relocate`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          newUnitId,
          newUnit,
          effectiveDate: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to relocate tenant");
    }

    const result = await response.json();
    const updatedTenant = result.data || result;

    // Update unit statuses: old unit → available, new unit → occupied
    if (tenant.unitId) {
      const oldUnitId = tenant.unitId?._id || tenant.unitId;
      try {
        await fetch(`${API_BASE_URL}/api/units/${oldUnitId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ status: "available" }),
        });
      } catch (e) {
        console.warn("Could not update old unit status:", e.message);
      }
    }

    try {
      await fetch(`${API_BASE_URL}/api/units/${newUnitId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: "occupied" }),
      });
    } catch (e) {
      console.warn("Could not update new unit status:", e.message);
    }

    const index = tenants.findIndex((t) => (t._id || t.id) === tenantId);
    if (index !== -1) tenants[index] = updatedTenant;
    filteredTenants = [...tenants];

    renderTenants();
    showNotification("Tenant relocated successfully", "success");
  } catch (error) {
    console.error("Error relocating tenant:", error);
    showNotification(error.message || "Failed to relocate tenant", "error");
  }
}
