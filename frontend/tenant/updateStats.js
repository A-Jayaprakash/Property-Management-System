// Update statistics
function updateStats() {
  const activeTenants = tenants.filter((t) => t.status === "Active").length;
  const totalTenants = tenants.length;
  const expiringLeases = tenants.filter((t) => {
    const days = getDaysRemaining(t.leaseEndDate);
    return days <= 30 && days >= 0;
  }).length;
  const terminatedTenants = tenants.filter(
    (t) => t.status === "Terminated"
  ).length;

  document.getElementById("activeTenants").textContent = activeTenants;
  document.getElementById("totalTenants").textContent = totalTenants;
  document.getElementById("expiringLeases").textContent = expiringLeases;
  document.getElementById("terminatedTenants").textContent = terminatedTenants;
}
