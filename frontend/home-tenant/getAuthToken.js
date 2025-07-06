function getAuthToken() {
  return (
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken")
  );
}
