// Relocate tenant using the dedicated PATCH /relocate endpoint
async function relocateTenant(tenantId) {
  const tenant = tenants.find((t) => (t._id || t.id) === tenantId);
  if (!tenant) return;

  const newUnitNumber = prompt("Enter new unit number:", tenant.assignedUnit);
  if (!newUnitNumber || newUnitNumber.trim() === tenant.assignedUnit) return;

  const trimmedUnit = newUnitNumber.trim();

  try {
    // Fetch units for the tenant's property from API to resolve the unitId
    const propertyId = tenant.propertyId?._id || tenant.propertyId;
    const unitsRes = await fetch(
      `${API_BASE_URL}/api/units?property=${propertyId}`,
      { headers: getAuthHeaders() }
    );

    if (!unitsRes.ok) throw new Error("Failed to fetch units for property");

    const unitsData = await unitsRes.json();
    const unitList = Array.isArray(unitsData) ? unitsData : unitsData.units || [];
    const matched = unitList.find((u) => u.unit_number === trimmedUnit);

    if (!matched) {
      showNotification(
        `Unit "${trimmedUnit}" not found in this property. Check the unit number and try again.`,
        "error"
      );
      return;
    }

    if (matched.status === "occupied") {
      showNotification(
        `Unit "${trimmedUnit}" is already occupied by another tenant.`,
        "error"
      );
      return;
    }

    const newUnitId = matched._id || matched.id;

    // Call the dedicated relocate endpoint
    const response = await fetch(
      `${API_BASE_URL}/api/tenants/${tenantId}/relocate`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          newUnitId,
          newUnit: trimmedUnit,
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

    // Free the old unit
    const oldUnitId = tenant.unitId?._id || tenant.unitId;
    if (oldUnitId) {
      await fetch(`${API_BASE_URL}/api/units/${oldUnitId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: "available" }),
      }).catch((e) => console.warn("Could not free old unit:", e.message));
    }

    // Mark the new unit as occupied
    await fetch(`${API_BASE_URL}/api/units/${newUnitId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: "occupied" }),
    }).catch((e) => console.warn("Could not mark new unit occupied:", e.message));

    // Update local state
    const index = tenants.findIndex((t) => (t._id || t.id) === tenantId);
    if (index !== -1) tenants[index] = updatedTenant;
    filteredTenants = [...tenants];

    renderTenants();
    showNotification(
      `Tenant relocated to unit "${trimmedUnit}" successfully`,
      "success"
    );
  } catch (error) {
    console.error("Error relocating tenant:", error);
    showNotification(error.message || "Failed to relocate tenant", "error");
  }
}
