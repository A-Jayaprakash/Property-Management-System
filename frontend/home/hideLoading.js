function hideLoading() {
  // Loading will be replaced by updateStatsDisplay
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "message error";
  errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;

  const container = document.querySelector(".container");
  container.insertBefore(errorDiv, container.firstChild);

  setTimeout(() => errorDiv.remove(), 5000);
}
