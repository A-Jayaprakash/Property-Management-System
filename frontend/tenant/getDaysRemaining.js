// Get days remaining until lease expiry
function getDaysRemaining(endDate) {
  const today = new Date();
  const end = new Date(endDate);
  const timeDiff = end.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}
