// Extend lease
async function extendLease(tenantId) {
  const tenant = tenants.find((t) => t.id === tenantId);
  if (!tenant) return;

  const months = prompt("Enter number of months to extend lease:", "12");
  if (!months || isNaN(months)) return;

  const currentEndDate = new Date(tenant.leaseEndDate);
  const newEndDate = new Date(currentEndDate);
  newEndDate.setMonth(newEndDate.getMonth() + parseInt(months));

  try {
    const response = await fetch(`/api/tenants/${tenantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        ...tenant,
        leaseEndDate: newEndDate.toISOString().split("T")[0],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to extend lease");
    }

    const updatedTenant = await response.json();
    const index = tenants.findIndex((t) => t.id === tenantId);
    tenants[index] = updatedTenant;
    filteredTenants = [...tenants];

    renderTenants();
    updateStats();
    showNotification(`Lease extended by ${months} months`, "success");
  } catch (error) {
    console.error("Error extending lease:", error);
    showNotification("Failed to extend lease", "error");
  }
}
