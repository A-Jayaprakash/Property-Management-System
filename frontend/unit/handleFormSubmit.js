// Handle form submission
document
  .getElementById("unitForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const unitData = {};

    // Convert form data to object
    for (let [key, value] of formData.entries()) {
      if (key === "amenities") {
        if (!unitData.amenities) unitData.amenities = [];
        unitData.amenities.push(value);
      } else {
        unitData[key] = value;
      }
    }

    // Convert numeric fields
    ["area", "floor", "rent", "security_deposit", "maintenance_fee"].forEach(
      (field) => {
        if (unitData[field]) {
          unitData[field] = Number(unitData[field]);
        }
      }
    );

    try {
      console.log("UNIT ID BEFORE FETCH CALL:", editingUnitId);
      const url = editingUnitId
        ? `${API_BASE_URL}/units/${editingUnitId}`
        : `${API_BASE_URL}/units`;

      const method = editingUnitId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(unitData),
      });

      if (response.ok) {
        loadUnits(currentPage);
        loadStats();
        showSuccess(
          editingUnitId
            ? "Unit updated successfully!"
            : "Unit created successfully!"
        );
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error saving unit:", error);
      alert("Error saving unit. Please try again.");
    }
  });
