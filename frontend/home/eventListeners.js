// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  initializeTheme();

  if (!checkAuthentication()) {
    return;
  }

  loadDashboardStats();

  // Theme toggle
  document.getElementById("themeToggle").addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeButton(newTheme);

    // Smooth transition
    document.body.style.transition = "all 0.3s ease";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 300);
  });

  // Add animation delays
  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.1}s`;
  });

  const slideElements = document.querySelectorAll(".slide-in");
  slideElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.2}s`;
  });
});
