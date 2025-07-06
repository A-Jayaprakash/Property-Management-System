// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  checkAuthentication();
  loadProperties();
  loadTenants();
  setupEventListeners();
});
