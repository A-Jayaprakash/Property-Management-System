// Check how many units have been created for a property vs its configured limit.
// Updates the capacity info label and enables/disables the Save button.
async function checkPropertyCapacity(propertyId) {
  const infoEl = document.getElementById("unitCapacityInfo");
  const saveBtn = document.querySelector('#unitForm button[type="submit"]');

  // Clear info and re-enable button when no property is selected
  if (!propertyId) {
    infoEl.textContent = "";
    if (saveBtn) saveBtn.disabled = false;
    return;
  }

  // Find property in local array (already loaded on page init)
  const property = properties.find((p) => p._id === propertyId);
  if (!property) return;

  const maxCount = property.unitCount;

  try {
    // Fetch current unit count for this property from the API
    const res = await fetch(
      `${API_BASE_URL}/api/units?property=${propertyId}&limit=1`,
      {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return;

    const data = await res.json();
    const usedCount = data.pagination?.total_units ?? 0;
    const remaining = maxCount - usedCount;

    if (remaining <= 0) {
      infoEl.innerHTML =
        `<span style="color:#dc3545;font-weight:600;">` +
        `⚠ Unit limit reached: ${usedCount} / ${maxCount} units already created for this property.` +
        `</span>`;
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.title = "Unit limit reached for this property";
      }
    } else {
      const color = remaining === 1 ? "#e67e22" : "#28a745";
      infoEl.innerHTML =
        `<span style="color:${color};">` +
        `${usedCount} / ${maxCount} units created — ` +
        `${remaining} slot${remaining !== 1 ? "s" : ""} remaining` +
        `</span>`;
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.title = "";
      }
    }
  } catch (err) {
    console.warn("Could not check property capacity:", err);
  }
}
