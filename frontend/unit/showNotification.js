function showNotification(message, type = "info") {
  // Re-use the existing successMessage div with colour coding
  const div = document.getElementById("successMessage");
  if (!div) return;

  div.textContent = message;
  div.style.display = "block";
  div.style.backgroundColor =
    type === "error"
      ? "#f8d7da"
      : type === "warning"
      ? "#fff3cd"
      : "#d4edda";
  div.style.color =
    type === "error"
      ? "#721c24"
      : type === "warning"
      ? "#856404"
      : "#155724";
  div.style.border =
    type === "error"
      ? "1px solid #f5c6cb"
      : type === "warning"
      ? "1px solid #ffeeba"
      : "1px solid #c3e6cb";

  setTimeout(() => {
    div.style.display = "none";
  }, 4000);
}
