async function loadUnitsForProperty() {
  const propertyId = document.getElementById("propertySelect").value;
  const unitSelect = document.getElementById("assignedUnit");

  unitSelect.innerHTML = '<option value="">Select a unit...</option>';

  if (!propertyId) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/units?propertyId=${propertyId}&status=available`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load units");
    }

    const data = await response.json();
    console.log("API units response:", data);

    const availableUnits = Array.isArray(data) ? data : data.units || [];

    availableUnits.forEach((unit) => {
      const option = document.createElement("option");
      // Change this line: use unit_number instead of unit ID
      option.value = unit.unit_number;
      option.textContent = `${unit.unit_number} - ${unit.type} (${unit.area}sqft)`;
      option.dataset.rent = unit.rent;
      option.dataset.unitId = unit.id || unit._id; // Store the actual unit ID as data attribute
      unitSelect.appendChild(option);
    });

    // Auto-fill rent when unit is selected
    unitSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption && selectedOption.dataset.rent) {
        document.getElementById("monthlyRent").value =
          selectedOption.dataset.rent;
      }
    });
  } catch (error) {
    console.error("Error loading units:", error);
    showNotification("Failed to load units", "error");
  }
}
