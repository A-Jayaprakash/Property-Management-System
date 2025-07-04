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
