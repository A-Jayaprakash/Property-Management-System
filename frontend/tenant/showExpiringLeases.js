// Show expiring leases
function showExpiringLeases() {
  const expiringTenants = tenants.filter((tenant) => {
    const days = getDaysRemaining(tenant.leaseEndDate);
    return days <= 30 && days >= 0;
  });

  if (expiringTenants.length === 0) {
    showNotification("No leases expiring in the next 30 days", "warning");
    return;
  }

  filteredTenants = expiringTenants;
  currentPage = 1;
  renderTenants();
  showNotification(
    `Found ${expiringTenants.length} expiring leases`,
    "warning"
  );
}
