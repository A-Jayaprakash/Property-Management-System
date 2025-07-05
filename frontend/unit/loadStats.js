// Load statistics
async function loadStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/units/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const stats = await response.json();
      updateStatsDisplay(stats);
    } else {
      throw new Error("Failed to load stats");
    }
  } catch (error) {
    console.error("Error loading stats:", error);
    // Use mock stats for demo
    const mockStats = {
      total_units: 5,
      available_units: 2,
      occupied_units: 1,
      maintenance_units: 1,
      reserved_units: 1,
      occupancy_rate: 20,
      avg_rent: 28600,
    };
    updateStatsDisplay(mockStats);
  }
}
