// Relocate tenant
async function relocateTenant(tenantId) {
  const tenant = tenants.find((t) => t.id === tenantId);
  if (!tenant) return;

  // Show a simple dialog for unit selection
  const newUnit = prompt("Enter new unit number:", tenant.assignedUnit);
  if (!newUnit || newUnit === tenant.assignedUnit) return;

  try {
    const response = await fetch(`/api/tenants/${tenantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        ...tenant,
        assignedUnit: newUnit,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to relocate tenant");
    }

    // Update unit statuses
    await updateUnitStatus(tenant.assignedUnit, "available");
    await updateUnitStatus(newUnit, "occupied");

    const updatedTenant = await response.json();
    const index = tenants.findIndex((t) => t.id === tenantId);
    tenants[index] = updatedTenant;
    filteredTenants = [...tenants];

    renderTenants();
    showNotification("Tenant relocated successfully", "success");
  } catch (error) {
    console.error("Error relocating tenant:", error);
    showNotification("Failed to relocate tenant", "error");
  }
}
