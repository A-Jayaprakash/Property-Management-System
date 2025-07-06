function updateUserDisplay() {
  if (currentUser) {
    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    const userRole = document.getElementById("userRole");

    // Update user name
    const displayName = currentUser.name || currentUser.username || "User";
    userName.textContent = displayName;

    // Update avatar with initials
    const initials = displayName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    userAvatar.textContent = initials;

    // Update role
    userRole.textContent = (currentUser.role || "tenant").toUpperCase();
  }
}
