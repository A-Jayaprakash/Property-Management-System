function logout() {
  // Clear authentication tokens
  sessionStorage.removeItem("authToken");
  localStorage.removeItem("authToken");

  // Make logout API call if available
  fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .catch((error) => {
      console.log("Logout API call failed:", error);
    })
    .finally(() => {
      window.location.href = "login.html";
    });
}
