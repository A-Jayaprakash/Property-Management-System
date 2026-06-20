// editMode = true when editing an existing tenant (show all units, not just available)
async function loadUnitsForProperty(editMode = false) {
  const propertyId = document.getElementById("propertySelect").value;
  const unitSelect = document.getElementById("assignedUnit");

  unitSelect.innerHTML = '<option value="">Select a unit...</option>';

  if (!propertyId) {
    return;
  }

  try {
    // In edit mode include occupied units so the current assignment stays visible
    const url = editMode
      ? `${API_BASE_URL}/api/units?property=${propertyId}`
      : `${API_BASE_URL}/api/units?property=${propertyId}&status=available`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to load units");
    }

    const data = await response.json();
    console.log("API units response:", data);

    const unitList = Array.isArray(data) ? data : data.units || [];

    unitList.forEach((unit) => {
      const option = document.createElement("option");
      option.value = unit.unit_number;
      option.textContent = `${unit.unit_number} - ${unit.type} (${unit.area} sqft)${unit.status !== "available" ? ` [${unit.status}]` : ""}`;
      option.dataset.rent = unit.rent;
      option.dataset.unitId = unit._id || unit.id;
      unitSelect.appendChild(option);
    });

    // Auto-fill rent when unit is selected (use onchange to avoid accumulating listeners)
    unitSelect.onchange = function () {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption && selectedOption.dataset.rent) {
        document.getElementById("monthlyRent").value = selectedOption.dataset.rent;
      }
    };
  } catch (error) {
    console.error("Error loading units:", error);
    showNotification("Failed to load units", "error");
  }
}
