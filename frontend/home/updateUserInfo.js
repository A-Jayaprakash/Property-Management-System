function updateUserInfo() {
  if (!userData || !userData.user) return;

  const user = userData.user;
  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const userRole = document.getElementById("userRole");

  // Update avatar with initials
  const initials = (user.name || user.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  userAvatar.textContent = initials;

  // Update name
  userName.textContent = user.name || user.username || "User";

  // Update role
  userRole.textContent = (user.role || "tenant").toUpperCase();

  // Show admin/manager cards and quick actions
  if (user.role === "admin" || user.role === "manager") {
    const amenitiesCard = document.getElementById("amenitiesCard");
    if (amenitiesCard) amenitiesCard.style.display = "";
    const amenitiesQuickAction = document.getElementById("amenitiesQuickAction");
    if (amenitiesQuickAction) amenitiesQuickAction.style.display = "";
    const chargesCard = document.getElementById("chargesCard");
    if (chargesCard) chargesCard.style.display = "";
    const chargesQuickAction = document.getElementById("chargesQuickAction");
    if (chargesQuickAction) chargesQuickAction.style.display = "";
  }
}
