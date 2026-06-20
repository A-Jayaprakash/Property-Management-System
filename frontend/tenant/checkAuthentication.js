// Check authentication and get manager ID
function checkAuthentication() {
  const userData = sessionStorage.getItem("userData");
  if (!userData) {
    window.location.href = "login.html";
    return;
  }

  const parsed = JSON.parse(userData);
  const user = parsed.user || parsed;

  if (user.role !== "manager" && user.role !== "admin") {
    showNotification("Access denied. Manager or Admin role required.", "error");
    window.location.href = "home.html";
    return;
  }

  managerId = user.id;
}
