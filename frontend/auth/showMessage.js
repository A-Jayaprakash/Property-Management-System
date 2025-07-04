function showMessage(text, type = "error") {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";

  // Hide message after 5 seconds
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 5000);
}
