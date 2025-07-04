function openAddModal() {
  // Check if user has permission to add properties
  const userRole = window.userData?.user?.role || "tenant";

  if (userRole === "tenant") {
    showError("Access denied: Only admin and manager can create properties");
    return;
  }

  currentEditId = null;
  document.getElementById("modalTitle").textContent = "Add New Property";
  document.getElementById("submitBtn").textContent = "Save Property";
  document.getElementById("propertyForm").reset();
  document.getElementById("propertyModal").style.display = "block";
}
