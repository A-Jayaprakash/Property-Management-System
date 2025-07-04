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
