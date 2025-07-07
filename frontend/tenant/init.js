document.addEventListener("DOMContentLoaded", async function () {
  checkAuthentication(); // assumed to be synchronous or fast

  await loadProperties(); // wait for properties to load before anything depends on it

  // Attach event listener AFTER properties are loaded
  document
    .getElementById("propertySelect")
    .addEventListener("change", loadUnitsForProperty);

  await loadTenants(); // wait for tenants to load
  setupEventListeners(); // any other click handlers etc.
});
