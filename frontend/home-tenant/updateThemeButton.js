function updateThemeButton(theme) {
  const themeIcon = themeToggle.querySelector("i");
  const themeText = themeToggle.querySelector("span");

  if (theme === "dark") {
    themeIcon.className = "fas fa-sun";
    themeText.textContent = "Light Mode";
  } else {
    themeIcon.className = "fas fa-moon";
    themeText.textContent = "Dark Mode";
  }
}
