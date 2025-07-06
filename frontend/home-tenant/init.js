// Enhanced init.js with fallback data and better error handling
document.addEventListener("DOMContentLoaded", function () {
  // Check if user is authenticated
  const token = getAuthToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Initialize with loading state
  initializeLoadingState();

  // Fetch user info and then properties
  fetchCurrentUser();
  fetchPropertiesAndUnits();
});

// Initialize loading state
function initializeLoadingState() {
  // Update stats with loading state
  document.getElementById("totalProperties").textContent = "Loading...";
  document.getElementById("availableUnits").textContent = "Loading...";
  document.getElementById("avgRent").textContent = "Loading...";
}

// Fallback function to load mock data when API is not available
function loadMockData() {
  console.log("Loading mock data as fallback...");

  // Mock properties data
  const mockProperties = [
    {
      _id: "mock_prop_1",
      name: "Sunset Apartments",
      type: "apartment",
      address: "123 Main Street, Downtown",
      locality: "City Center",
      unitCount: 12,
      createdAt: new Date().toISOString(),
      rent: 1200,
      bedrooms: 2,
      bathrooms: 1,
      area: 850,
    },
    {
      _id: "mock_prop_2",
      name: "Garden View Condos",
      type: "condo",
      address: "456 Oak Avenue, Suburbs",
      locality: "Oak Park",
      unitCount: 8,
      createdAt: new Date().toISOString(),
      rent: 1500,
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
    },
    {
      _id: "mock_prop_3",
      name: "Modern Studio Complex",
      type: "studio",
      address: "789 Pine Road, Arts District",
      locality: "Arts Quarter",
      unitCount: 6,
      createdAt: new Date().toISOString(),
      rent: 800,
      bedrooms: 1,
      bathrooms: 1,
      area: 500,
    },
  ];

  // Mock units data
  const mockUnits = [
    // Sunset Apartments units
    {
      _id: "mock_unit_1",
      propertyId: "mock_prop_1",
      unitNumber: "A101",
      bedrooms: 2,
      bathrooms: 1,
      rent: 1200,
      status: "available",
      area: 850,
    },
    {
      _id: "mock_unit_2",
      propertyId: "mock_prop_1",
      unitNumber: "A102",
      bedrooms: 2,
      bathrooms: 1,
      rent: 1250,
      status: "available",
      area: 900,
    },
    {
      _id: "mock_unit_3",
      propertyId: "mock_prop_1",
      unitNumber: "A103",
      bedrooms: 2,
      bathrooms: 1,
      rent: 1180,
      status: "occupied",
      area: 820,
    },
    // Garden View Condos units
    {
      _id: "mock_unit_4",
      propertyId: "mock_prop_2",
      unitNumber: "B201",
      bedrooms: 3,
      bathrooms: 2,
      rent: 1500,
      status: "available",
      area: 1200,
    },
    {
      _id: "mock_unit_5",
      propertyId: "mock_prop_2",
      unitNumber: "B202",
      bedrooms: 3,
      bathrooms: 2,
      rent: 1600,
      status: "available",
      area: 1300,
    },
    // Modern Studio Complex units
    {
      _id: "mock_unit_6",
      propertyId: "mock_prop_3",
      unitNumber: "C301",
      bedrooms: 1,
      bathrooms: 1,
      rent: 800,
      status: "available",
      area: 500,
    },
  ];

  // Set global variables
  allProperties = mockProperties;
  allUnits = mockUnits;

  // Process the data
  const propertiesWithUnits = allProperties.map((property) => {
    const propertyUnits = allUnits.filter(
      (unit) => unit.propertyId === property._id
    );
    return {
      ...property,
      units: propertyUnits,
      availableUnits: propertyUnits.filter(
        (unit) => unit.status === "available"
      ).length,
      totalUnits: propertyUnits.length || property.unitCount || 1,
    };
  });

  filteredProperties = propertiesWithUnits;

  // Update UI
  updateStats();
  renderProperties(filteredProperties);

  // Show a notification about using mock data
  showMockDataNotification();
}

// Show notification that mock data is being used
function showMockDataNotification() {
  const notification = document.createElement("div");
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #f6ad55, #ed8936);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 1000;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-info-circle"></i>
        <strong>Demo Mode</strong>
      </div>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">
        Using sample data - API server may be offline
      </p>
    </div>
  `;

  document.body.appendChild(notification);

  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Add CSS animation for notification
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
