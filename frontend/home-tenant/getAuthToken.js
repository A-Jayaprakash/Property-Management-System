// Get authentication token
function getAuthToken() {
  return (
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken")
  );
}
