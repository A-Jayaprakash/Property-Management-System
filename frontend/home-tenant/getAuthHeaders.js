// Get authentication headers for API requests
function getAuthHeaders() {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
