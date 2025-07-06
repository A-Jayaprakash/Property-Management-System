// Open Add Unit Modal
async function openAddUnitModal() {
  try {
    // Reset form and modal state
    editingUnitId = null;
    document.getElementById("modalTitle").textContent = "Add New Unit";
    document.getElementById("unitForm").reset();

    // Ensure properties are loaded before opening modal
    if (properties.length === 0) {
      console.log("Properties not loaded, loading now...");
      await loadProperties();
    }

    // Double-check that properties are now available
    if (properties.length === 0) {
      showNotification(
        "No properties available. Please add a property first.",
        "warning"
      );
      return;
    }

    // Populate dropdowns with fresh data
    populatePropertyDropdowns();

    // Show the modal
    document.getElementById("unitModal").style.display = "block";

    // Focus on first input
    document.getElementById("unit_number").focus();
  } catch (error) {
    console.error("Error opening add unit modal:", error);
    showNotification("Error opening form. Please try again.", "error");
  }
}

// Close modal function
function closeModal() {
  const modal = document.getElementById("unitModal");
  modal.style.display = "none";

  // Reset form
  document.getElementById("unitForm").reset();
  editingUnitId = null;
}
