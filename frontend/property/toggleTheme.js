function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  // Update button icon and text
  const icon = document.getElementById("themeIcon");
  const text = document.getElementById("themeText");
  if (theme === "dark") {
    icon.textContent = "🌞";
    text.textContent = "Light Mode";
  } else {
    icon.textContent = "🌙";
    text.textContent = "Dark Mode";
  }
}

function initializeTheme() {
  // Check if theme functions are available
  if (typeof toggleTheme === "function") {
    // Theme is already initialized
    return;
  }

  // Set default theme
  document.documentElement.setAttribute("data-theme", "light");

  // Add theme toggle functionality if button exists
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);

      // Update button text
      const themeIcon = document.getElementById("themeIcon");
      const themeText = document.getElementById("themeText");
      if (themeIcon && themeText) {
        themeIcon.textContent = newTheme === "dark" ? "☀️" : "🌙";
        themeText.textContent =
          newTheme === "dark" ? "Light Mode" : "Dark Mode";
      }
    });
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);

  // Save user preference
  try {
    localStorage.setItem("theme", newTheme);
  } catch (e) {
    console.warn("Could not save theme preference");
  }

  // Add a subtle animation effect
  document.body.style.transition = "all 0.3s ease";
  setTimeout(() => {
    document.body.style.transition = "";
  }, 300);
}
