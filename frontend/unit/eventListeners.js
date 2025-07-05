// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("unitModal");
  if (event.target === modal) {
    closeModal();
  }
};

// Handle keyboard shortcuts
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});
