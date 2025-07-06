// Authentication
function checkAuthentication() {
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  const userDataStr =
    sessionStorage.getItem("userData") || localStorage.getItem("userData");

  if (!token || !userDataStr) {
    window.location.href = "login.html";
    return false;
  }

  try {
    userData = JSON.parse(userDataStr);
    updateUserInfo();
    return true;
  } catch (error) {
    console.error("Error parsing user data:", error);
    logout();
    return false;
  }
}
