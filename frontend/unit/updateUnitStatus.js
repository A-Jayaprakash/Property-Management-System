// Update unit status — prompt the user, then call the API
async function updateUnitStatus(unitId, currentStatus) {
  const newStatus = prompt(
    `Current status: ${currentStatus}\nEnter new status:\navailable / occupied / maintenance / reserved`
  )?.toLowerCase();

  if (!newStatus) return; // user cancelled

  if (!["available", "occupied", "maintenance", "reserved"].includes(newStatus)) {
    alert("Invalid status. Please enter one of: available, occupied, maintenance, reserved");
    return;
  }

  if (newStatus === currentStatus) return; // nothing to do

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/units/${unitId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      loadUnits(currentPage);
      loadStats();
      showSuccess(`Unit status updated to "${newStatus}" successfully`);
    } else {
      alert(`Could not update status: ${result.message}`);
    }
  } catch (error) {
    console.error("Error updating unit status:", error);
    alert("Error updating unit status. Please try again.");
  }
}
