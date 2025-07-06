themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  body.setAttribute("data-theme", currentTheme);
  updateThemeButton(currentTheme);
});
