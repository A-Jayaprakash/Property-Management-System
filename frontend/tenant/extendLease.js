// Extend lease using the dedicated PATCH /extend-lease endpoint
async function extendLease(tenantId) {
  const tenant = tenants.find((t) => (t._id || t.id) === tenantId);
  if (!tenant) return;

  const months = prompt("Enter number of months to extend lease:", "12");
  if (!months || isNaN(months) || parseInt(months) <= 0) return;

  const currentEndDate = new Date(tenant.leaseEndDate);
  const newEndDate = new Date(currentEndDate);
  newEndDate.setMonth(newEndDate.getMonth() + parseInt(months));

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tenants/${tenantId}/extend-lease`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          newEndDate: newEndDate.toISOString().split("T")[0],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to extend lease");
    }

    const result = await response.json();
    const updatedTenant = result.data || result;

    const index = tenants.findIndex((t) => (t._id || t.id) === tenantId);
    if (index !== -1) tenants[index] = updatedTenant;
    filteredTenants = [...tenants];

    renderTenants();
    updateStats();
    showNotification(`Lease extended by ${months} months`, "success");
  } catch (error) {
    console.error("Error extending lease:", error);
    showNotification(error.message || "Failed to extend lease", "error");
  }
}
