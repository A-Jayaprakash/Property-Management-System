function checkAuthentication() {
  const token = sessionStorage.getItem("authToken");
  const userDataStr = sessionStorage.getItem("userData");

  if (!token || !userDataStr) {
    console.log("No authentication data found, redirecting to login");
    window.location.href = "login.html";
    return false;
  }

  try {
    const userData = JSON.parse(userDataStr);

    // Store globally for easy access
    authToken = token;
    window.userData = {
      token: token,
      user: userData,
    };

    isAuthenticated = true;
    return true;
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Clear invalid data and redirect to login
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    window.location.href = "login.html";
    return false;
  }
}
