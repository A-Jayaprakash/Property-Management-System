async function fetchCurrentUser() {
  try {
    const response = await fetch("/api/auth/", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      currentUser = await response.json();
      updateUserDisplay();
    } else if (response.status === 401) {
      // Token expired or invalid
      logout();
      return;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
}
