function getAuthHeaders() {
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
