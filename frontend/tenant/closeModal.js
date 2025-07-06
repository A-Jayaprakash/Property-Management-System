// Close modal
function closeModal() {
  const modal = document.getElementById("tenantModal");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
  editingTenant = null;
}
