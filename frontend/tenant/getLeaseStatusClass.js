// Get lease status class for styling
function getLeaseStatusClass(tenant) {
  const daysRemaining = getDaysRemaining(tenant.leaseEndDate);
  if (daysRemaining < 0) return "lease-expired";
  if (daysRemaining <= 30) return "lease-expiring";
  return "";
}
