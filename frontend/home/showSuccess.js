function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "message success";
  successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

  const container = document.querySelector(".container");
  container.insertBefore(successDiv, container.firstChild);

  setTimeout(() => successDiv.remove(), 5000);
}
