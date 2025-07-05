// Update unit status
async function updateUnitStatus(unitId, currentStatus) {
  const newStatus = prompt(
    `Current status: ${currentStatus}\nEnter new status (available/occupied/maintenance/reserved):`
  );

  if (
    !newStatus ||
    !["available", "occupied", "maintenance", "reserved"].includes(
      newStatus.toLowerCase()
    )
  ) {
    alert(
      "Invalid status. Please use: available, occupied, maintenance, or reserved"
    );
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/units/${unitId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: newStatus.toLowerCase(),
      }),
    });

    if (response.ok) {
      loadUnits(currentPage);
      loadStats();
      alert("Unit status updated successfully!");
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error("Error updating unit status:", error);
    alert("Error updating unit status. Please try again.");
  }
}
