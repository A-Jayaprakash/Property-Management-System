// Fetches property-level amenities from the API and renders them as checkboxes.
// Pass savedAmenities[] to pre-check values when editing an existing property.
async function loadPropertyAmenities(savedAmenities = []) {
  const container = document.getElementById("propertyAmenitiesContainer");
  if (!container) return;

  try {
    // Derive base URL independently (property page's API_BASE_URL points to /api/properties)
    const baseUrl =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? "http://localhost:3000"
        : window.location.origin;

    const res = await fetch(`${baseUrl}/api/amenities?level=property`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to load property amenities");

    const data = await res.json();
    const amenities = data.data || [];

    if (amenities.length === 0) {
      container.innerHTML =
        '<small style="color:#aaa;">No property amenities configured. Add some in Amenity Management.</small>';
      return;
    }

    container.innerHTML = amenities
      .map(
        (a) => `
      <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
        <input type="checkbox" name="amenities" value="${escapeHtml(a.name)}"
          ${savedAmenities.includes(a.name) ? "checked" : ""}>
        ${escapeHtml(a.name)}
      </label>`
      )
      .join("");
  } catch (err) {
    console.error("loadPropertyAmenities error:", err);
    container.innerHTML =
      '<small style="color:#c00;">Could not load amenities. Refresh to retry.</small>';
  }
}
