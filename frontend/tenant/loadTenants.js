async function loadTenants() {
  try {
    document.getElementById("loadingState").style.display = "block";
    document.getElementById("tenantGrid").style.display = "none";
    document.getElementById("emptyState").style.display = "none";

    const response = await fetch(
      `http://localhost:3000/api/tenants?managerId=${managerId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load tenants");
    }

    const { data } = await response.json();

    tenants = Array.isArray(data) ? data : data.tenants || [];
    filteredTenants = [...tenants];

    document.getElementById("loadingState").style.display = "none";

    if (tenants.length === 0) {
      document.getElementById("emptyState").style.display = "block";
    } else {
      document.getElementById("tenantGrid").style.display = "grid";
      renderTenants();
    }

    updateStats();
  } catch (error) {
    console.error("Error loading tenants:", error);
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("emptyState").style.display = "block";
    showNotification("Failed to load tenants", "error");
  }
}
