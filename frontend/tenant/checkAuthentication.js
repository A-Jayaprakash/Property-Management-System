// Check authentication and get manager ID
function checkAuthentication() {
  const userData = sessionStorage.getItem("userData");
  if (!userData) {
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(userData);
  if (user.role !== "manager") {
    showNotification("Access denied. Manager role required.", "error");
    window.location.href = "home.html";
    return;
  }

  managerId = user.id;
}
