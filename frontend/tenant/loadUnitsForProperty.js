// Load units for selected property
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
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load units");
    }

    const availableUnits = await response.json();

    availableUnits.forEach((unit) => {
      const option = document.createElement("option");
      option.value = unit.id;
      option.textContent = `${unit.unitNumber} - ${unit.unitType} (${unit.bedrooms}BR/${unit.bathrooms}BA)`;
      option.dataset.rent = unit.rent;
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
