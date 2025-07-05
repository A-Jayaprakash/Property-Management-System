function openAddUnitModal() {
  editingUnitId = null;
  document.getElementById("modalTitle").textContent = "Add New Unit";
  document.getElementById("unitForm").reset();
  document.getElementById("unitModal").style.display = "block";
}
