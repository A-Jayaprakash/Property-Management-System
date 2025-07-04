function editProperty(id) {
  const property = properties.find((p) => p._id === id);
  if (!property) return;

  // Check if user has permission to edit this property
  const userRole = window.userData?.user?.role || "tenant";
  const currentUserId = window.userData?.user?.id;

  if (userRole === "tenant") {
    showError("Access denied: Only admin and manager can edit properties");
    return;
  }

  if (userRole === "manager" && property.createdBy !== currentUserId) {
    showError("Access denied: You can only edit properties you created");
    return;
  }

  currentEditId = id;
  document.getElementById("modalTitle").textContent = "Edit Property";
  document.getElementById("submitBtn").textContent = "Update Property";

  // Populate form
  document.getElementById("propertyName").value = property.name;
  document.getElementById("propertyAddress").value = property.address;
  document.getElementById("propertyLocality").value = property.locality || "";
  document.getElementById("propertyType").value = property.type;
  document.getElementById("unitCount").value = property.unitCount;

  document.getElementById("propertyModal").style.display = "block";
}
