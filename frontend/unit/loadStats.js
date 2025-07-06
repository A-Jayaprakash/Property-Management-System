// Load unit statistics - Fully dynamic from database
async function loadStats() {
  try {
    console.log("Loading unit statistics from database...");

    const data = await apiRequest("/units/stats");

    if (data.stats) {
      // Update statistics display
      updateStatsDisplay(data.stats);
      console.log("Statistics loaded successfully:", data.stats);
    } else {
      console.warn("No statistics found in database response");
      // Show zero stats
      updateStatsDisplay({
        total_units: 0,
        available_units: 0,
        occupied_units: 0,
        maintenance_units: 0,
        reserved_units: 0,
        occupancy_rate: 0,
        average_rent: 0,
      });
    }
  } catch (error) {
    console.error("Error loading statistics:", error);

    // Show error notification
    const errorMessage = error.message.includes("Authentication failed")
      ? "Session expired. Please login again."
      : "Failed to load statistics. Please try refreshing the page.";

    showNotification(errorMessage, "error");

    // Show zero stats as fallback
    updateStatsDisplay({
      total_units: 0,
      available_units: 0,
      occupied_units: 0,
      maintenance_units: 0,
      reserved_units: 0,
      occupancy_rate: 0,
      average_rent: 0,
    });
  }
}

// Update statistics display
function updateStatsDisplay(stats) {
  // Update individual stat elements
  const elements = {
    totalUnits: stats.total_units || 0,
    availableUnits: stats.available_units || 0,
    occupiedUnits: stats.occupied_units || 0,
    maintenanceUnits: stats.maintenance_units || 0,
    occupancyRate: `${Math.round(stats.occupancy_rate || 0)}%`,
    avgRent: `₹${formatNumber(stats.average_rent || 0)}`,
  };

  // Update DOM elements
  Object.entries(elements).forEach(([elementId, value]) => {
    const element = document.getElementById(elementId);
    if (element) {
      // Add animation effect
      element.style.transform = "scale(1.1)";
      element.style.transition = "transform 0.3s ease";

      setTimeout(() => {
        element.textContent = value;
        element.style.transform = "scale(1)";
      }, 150);
    }
  });

  // Update stat card colors based on status
  updateStatCardColors(stats);
}

// Update stat card colors based on values
function updateStatCardColors(stats) {
  const cards = document.querySelectorAll(".stat-card");

  cards.forEach((card, index) => {
    const icon = card.querySelector("i");
    if (!icon) return;

    // Reset classes
    icon.className = icon.className.replace(/text-\w+/g, "");

    // Add appropriate color classes based on card type
    switch (index) {
      case 0: // Total Units
        icon.classList.add(
          stats.total_units > 0 ? "text-primary" : "text-muted"
        );
        break;
      case 1: // Available Units
        icon.classList.add(
          stats.available_units > 0 ? "text-success" : "text-muted"
        );
        break;
      case 2: // Occupied Units
        icon.classList.add(
          stats.occupied_units > 0 ? "text-info" : "text-muted"
        );
        break;
      case 3: // Maintenance Units
        icon.classList.add(
          stats.maintenance_units > 0 ? "text-warning" : "text-muted"
        );
        break;
      case 4: // Occupancy Rate
        const rate = stats.occupancy_rate || 0;
        if (rate >= 80) icon.classList.add("text-success");
        else if (rate >= 50) icon.classList.add("text-warning");
        else icon.classList.add("text-danger");
        break;
      case 5: // Average Rent
        icon.classList.add(
          stats.average_rent > 0 ? "text-success" : "text-muted"
        );
        break;
    }
  });
}

// Format number with Indian currency format
function formatNumber(num) {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + "Cr";
  } else if (num >= 100000) {
    return (num / 100000).toFixed(1) + "L";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

// Auto-refresh stats every 5 minutes
function startStatsAutoRefresh() {
  setInterval(() => {
    console.log("Auto-refreshing statistics...");
    loadStats();
  }, 5 * 60 * 1000); // 5 minutes
}

// Initialize stats auto-refresh
document.addEventListener("DOMContentLoaded", () => {
  startStatsAutoRefresh();
});
