const commonPasswords = [
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "1234567890",
  "password1",
  "qwertyuiop",
  "123123",
  "dragon",
  "master",
  "hello",
  "login",
  "welcome123",
  "admin123",
  "root",
  "toor",
  "pass",
  "test",
  "guest",
  "user",
  "password12",
  "password!",
  "Password123",
  "Password1",
  "p@ssw0rd",
  "p@ssword",
  "passw0rd",
  "Password@123",
];

function validatePassword(password) {
  const requirements = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
    noCommon: !commonPasswords.includes(password.toLowerCase()),
    noSequential: !hasSequentialChars(password),
    noRepeated: !hasRepeatedChars(password),
  };

  const errors = [];
  if (!requirements.length)
    errors.push("Password must be at least 12 characters long");
  if (!requirements.uppercase)
    errors.push("Password must contain at least one uppercase letter");
  if (!requirements.lowercase)
    errors.push("Password must contain at least one lowercase letter");
  if (!requirements.number)
    errors.push("Password must contain at least one number");
  if (!requirements.special)
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  if (!requirements.noCommon)
    errors.push("Password is too common, please choose a different one");
  if (!requirements.noSequential)
    errors.push(
      "Password should not contain sequential characters (e.g., 123, abc)"
    );
  if (!requirements.noRepeated)
    errors.push(
      "Password should not contain repeated characters (e.g., aaa, 111)"
    );

  return {
    isValid: errors.length === 0,
    errors: errors,
    requirements: requirements,
    strength: calculatePasswordStrength(password, requirements),
  };
}

// Password confirmation validation
function validatePasswordConfirmation(password, confirmPassword) {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
}

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

// Check for sequential characters
function hasSequentialChars(password) {
  const sequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789",
    "qwertyuiopasdfghjklzxcvbnm",
  ];

  for (let seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      if (password.includes(seq.substr(i, 3))) {
        return true;
      }
    }
  }
  return false;
}

// Check for repeated characters
function hasRepeatedChars(password) {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }
  return false;
}

// Calculate password strength
function calculatePasswordStrength(password, requirements) {
  let score = 0;
  let maxScore = 8;

  // Basic requirements
  if (requirements.length) score++;
  if (requirements.uppercase) score++;
  if (requirements.lowercase) score++;
  if (requirements.number) score++;
  if (requirements.special) score++;
  if (requirements.noCommon) score++;
  if (requirements.noSequential) score++;
  if (requirements.noRepeated) score++;

  // Bonus points for length
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;
  maxScore += 2;

  // Bonus for character diversity
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.8) score += 1;
  maxScore += 1;

  const percentage = (score / maxScore) * 100;

  if (percentage < 40)
    return { level: "weak", text: "Weak", percentage: percentage };
  if (percentage < 60)
    return { level: "fair", text: "Fair", percentage: percentage };
  if (percentage < 80)
    return { level: "good", text: "Good", percentage: percentage };
  return { level: "strong", text: "Strong", percentage: percentage };
}

function getStrengthColor(level) {
  switch (level) {
    case "weak":
      return "#dc3545";
    case "fair":
      return "#fd7e14";
    case "good":
      return "#ffc107";
    case "strong":
      return "#28a745";
    default:
      return "#6c757d";
  }
}
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
