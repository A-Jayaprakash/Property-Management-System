function logout() {
  sessionStorage.clear();
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  window.location.href = "login.html";
}
