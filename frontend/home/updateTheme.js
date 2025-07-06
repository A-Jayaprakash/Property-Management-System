function updateThemeButton(theme) {
  const themeToggle = document.getElementById("themeToggle");
  const icon = themeToggle.querySelector("i");
  const text = themeToggle.querySelector("span");

  if (theme === "dark") {
    icon.className = "fas fa-sun";
    text.textContent = "Light Mode";
  } else {
    icon.className = "fas fa-moon";
    text.textContent = "Dark Mode";
  }
}
