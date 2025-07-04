// Enhanced password validation
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
