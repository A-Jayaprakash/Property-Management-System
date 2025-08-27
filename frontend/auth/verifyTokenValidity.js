async function verifyTokenValidity() {
  if (!authToken) {
    console.log("No token to verify");
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      // Fixed URL
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Token invalid or expired");
    }

    console.log("Token verified successfully");
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    window.location.href = "login.html";
    return false;
  }
}
