// Get authentication headers
function getAuthHeaders() {
  const token = sessionStorage.getItem("authToken");
  if (!token || token === "null" || token === "undefined") return {};

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
