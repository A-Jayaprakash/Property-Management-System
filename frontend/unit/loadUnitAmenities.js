// Fetches unit-level amenities from the API and renders them as checkboxes.
// Pass savedAmenities[] to pre-check values when editing an existing unit.
async function loadUnitAmenities(savedAmenities = []) {
  const container = document.getElementById("unitAmenitiesContainer");
  if (!container) return;

  try {
    const res = await apiRequest("/api/amenities?level=unit");
    const amenities = res.data || [];

    if (amenities.length === 0) {
      container.innerHTML =
        '<small style="color:#aaa;">No unit amenities configured.</small>';
      return;
    }

    container.innerHTML = amenities
      .map(
        (a) => `
      <div class="checkbox-item">
        <input type="checkbox" id="amenity_${a._id}" name="amenities" value="${a.name}"
          ${savedAmenities.includes(a.name) ? "checked" : ""}>
        <label for="amenity_${a._id}">${a.name}</label>
      </div>`
      )
      .join("");
  } catch (err) {
    console.error("loadUnitAmenities error:", err);
    container.innerHTML =
      '<small style="color:#c00;">Could not load amenities. Refresh to retry.</small>';
  }
}
