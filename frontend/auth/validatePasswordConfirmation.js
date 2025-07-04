// Password confirmation validation
function validatePasswordConfirmation(password, confirmPassword) {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
}
