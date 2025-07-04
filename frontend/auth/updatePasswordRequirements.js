// Update password requirements display
function updatePasswordRequirements(password) {
  const validation = validatePassword(password);
  const requirements = validation.requirements;

  // Update requirement indicators
  updateRequirement("req-length", requirements.length);
  updateRequirement("req-uppercase", requirements.uppercase);
  updateRequirement("req-lowercase", requirements.lowercase);
  updateRequirement("req-number", requirements.number);
  updateRequirement("req-special", requirements.special);
  updateRequirement("req-no-common", requirements.noCommon);

  // Update strength bar
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  const strength = validation.strength;

  strengthBar.style.width = `${strength.percentage}%`;
  strengthBar.className = `password-strength-bar strength-${strength.level}`;
  strengthText.textContent = `Password strength: ${strength.text}`;
  strengthText.style.color = getStrengthColor(strength.level);

  // Show/hide compromised password warning
  const compromisedWarning = document.getElementById("compromisedWarning");
  compromisedWarning.style.display = !requirements.noCommon ? "block" : "none";
}
