// Delete unit
async function deleteUnit(unitId) {
  if (
    !confirm(
      "Are you sure you want to delete this unit? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/units/${unitId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      loadUnits(currentPage);
      loadStats();
      alert("Unit deleted successfully!");
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting unit:", error);
    alert("Error deleting unit. Please try again.");
  }
}
