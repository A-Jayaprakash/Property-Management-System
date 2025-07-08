function showSuccess(message) {
  const successDiv = document.getElementById("successMessage");
  successDiv.textContent = message;
  successDiv.style.display = "block";
  setTimeout(() => {
    successDiv.style.display = "none";
  }, 3000);
}
