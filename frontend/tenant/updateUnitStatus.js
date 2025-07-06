// Update unit status
async function updateUnitStatus(unitId, status) {
  try {
    await fetch(`/api/units/${unitId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error("Error updating unit status:", error);
  }
}
