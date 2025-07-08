// Update unit status
async function updateUnitStatus(unitId, currentStatus) {
  const newStatus = prompt(
    `Current status: ${currentStatus}\nEnter new status (available / occupied / maintenance / reserved):`
  )?.toLowerCase();

  if (
    !newStatus ||
    !["available", "occupied", "maintenance", "reserved"].includes(newStatus)
  ) {
    alert(
      "Invalid status. Please use: available, occupied, maintenance, or reserved"
    );
    return;
  }

  // ❌ Block changing from "occupied" to "available" directly
  if (currentStatus === "occupied" && newStatus === "available") {
    alert(
      "Cannot mark unit as available while an active tenant is still occupying it.\nPlease terminate the lease first."
    );
    return; // Block the change
  }

  try {
    const response = await fetch(`${API_BASE_URL}/units/${unitId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      loadUnits(currentPage);
      loadStats();
      alert("Unit status updated successfully!");
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error updating unit status:", error);
    alert("Error updating unit status. Please try again.");
  }
}
