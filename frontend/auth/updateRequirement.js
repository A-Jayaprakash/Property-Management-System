function updateRequirement(id, met) {
  const element = document.getElementById(id);
  const icon = element.querySelector(".requirement-icon");

  if (met) {
    element.className = "requirement met";
    icon.textContent = "✓";
  } else {
    element.className = "requirement not-met";
    icon.textContent = "○";
  }
}
