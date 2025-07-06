// Enhanced fetchPropertiesAndUnits.js with backend URL configuration
const API_BASE_URL = "http://localhost:3000"; // Add this line at the top

async function fetchPropertiesAndUnits() {
  try {
    document.getElementById("loadingSpinner").style.display = "block";
    document.getElementById("propertiesGrid").style.display = "none";
    document.getElementById("noPropertiesMessage").style.display = "none";

    const headers = getAuthHeaders();
    console.log("Auth headers:", headers);

    // Check if we have a valid token
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      showErrorMessage("Authentication required. Please login again.");
      setTimeout(() => logout(), 2000);
      return;
    }

    console.log("Fetching properties...");

    // Fetch properties with better error handling
    const propertiesResponse = await fetch(`${API_BASE_URL}/api/properties`, {
      // Updated URL
      method: "GET",
      headers: headers,
    });

    console.log("Properties response status:", propertiesResponse.status);

    if (!propertiesResponse.ok) {
      if (propertiesResponse.status === 401) {
        console.error("Authentication failed - redirecting to login");
        showErrorMessage("Session expired. Redirecting to login...");
        setTimeout(() => logout(), 2000);
        return;
      }

      if (propertiesResponse.status === 404) {
        console.error("Properties endpoint not found");
        showErrorMessage(
          "Properties service is not available. Please contact support or try again later."
        );
        return;
      }

      if (propertiesResponse.status === 500) {
        console.error("Server error");
        showErrorMessage(
          "Server error occurred. Please try again later or contact support."
        );
        return;
      }

      const errorText = await propertiesResponse.text();
      console.error("Properties fetch error:", errorText);
      throw new Error(
        `Failed to fetch properties: ${propertiesResponse.status} - ${errorText}`
      );
    }

    const propertiesData = await propertiesResponse.json();
    console.log("Properties data received:", propertiesData);

    // Handle different response formats
    if (propertiesData.success !== undefined) {
      // API returns {success: true, data: [...]}
      allProperties = Array.isArray(propertiesData.data)
        ? propertiesData.data
        : [];
    } else if (propertiesData.properties) {
      // API returns {properties: [...]}
      allProperties = Array.isArray(propertiesData.properties)
        ? propertiesData.properties
        : [];
    } else {
      // API returns [...] directly
      allProperties = Array.isArray(propertiesData) ? propertiesData : [];
    }

    // Fetch units with fallback
    try {
      console.log("Fetching units...");
      const unitsResponse = await fetch(`${API_BASE_URL}/api/units`, {
        // Updated URL
        method: "GET",
        headers: headers,
      });

      console.log("Units response status:", unitsResponse.status);

      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        console.log("Units data received:", unitsData);

        // Handle different response formats for units
        if (unitsData.success !== undefined) {
          allUnits = Array.isArray(unitsData.data) ? unitsData.data : [];
        } else if (unitsData.units) {
          allUnits = Array.isArray(unitsData.units) ? unitsData.units : [];
        } else {
          allUnits = Array.isArray(unitsData) ? unitsData : [];
        }
      } else {
        console.log(
          "Units endpoint not available or error:",
          unitsResponse.status
        );
        allUnits = [];

        // If units endpoint is not available, create mock units from properties
        allUnits = createMockUnitsFromProperties(allProperties);
      }
    } catch (error) {
      console.log("Error fetching units:", error);
      allUnits = [];
    }

    // Combine properties with their units
    const propertiesWithUnits = allProperties.map((property) => {
      const propertyUnits = allUnits.filter(
        (unit) =>
          unit.propertyId === property._id ||
          unit.property === property._id ||
          unit.property_id === property._id
      );

      return {
        ...property,
        units: propertyUnits,
        availableUnits: propertyUnits.filter(
          (unit) => unit.status === "available"
        ).length,
        totalUnits:
          propertyUnits.length || property.unitCount || property.units || 1,
      };
    });

    filteredProperties = propertiesWithUnits;
    console.log("Final filtered properties:", filteredProperties);

    if (filteredProperties.length === 0) {
      showNoPropertiesMessage();
    } else {
      updateStats();
      renderProperties(filteredProperties);
    }
  } catch (error) {
    console.error("Error fetching data:", error);

    // Check if this is a connection/API issue and offer fallback
    if (
      error.message.includes("fetch") ||
      error.message.includes("404") ||
      error.message.includes("Cannot GET")
    ) {
      console.log("API seems to be unavailable, offering fallback options...");
      showAPIUnavailableMessage();
    } else if (error.message.includes("401")) {
      showErrorMessage("Authentication failed. Please login again.");
      setTimeout(() => logout(), 2000);
    } else {
      showErrorMessage(
        `Failed to load properties and units. Error: ${error.message}`
      );
    }
  } finally {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("propertiesGrid").style.display = "grid";
  }
}

// Add retry function
function retryFetchData() {
  fetchPropertiesAndUnits();
}

// Update UI
document.getElementById("loadingSpinner").style.display = "none";
document.getElementById("propertiesGrid").style.display = "grid";
document.getElementById("noPropertiesMessage").style.display = "none";

updateStats();
renderProperties(filteredProperties);

// Show success message
const successMessage = document.createElement("div");
successMessage.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #48bb78, #38a169);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-check-circle"></i>
        <span>Demo mode loaded successfully!</span>
      </div>
    </div>
  `;
document.body.appendChild(successMessage);

// Remove message after 3 seconds
setTimeout(() => {
  successMessage.remove();
}, 3000);

// Show API unavailable message with fallback options
function showAPIUnavailableMessage() {
  const propertiesGrid = document.getElementById("propertiesGrid");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const noPropertiesMessage = document.getElementById("noPropertiesMessage");

  loadingSpinner.style.display = "none";
  noPropertiesMessage.style.display = "none";
  propertiesGrid.style.display = "block";

  propertiesGrid.innerHTML = `
    <div class="api-unavailable-container" style="
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
      margin: 2rem 0;
      min-height: 400px;
    ">
      <div style="
        background: #fef5e7;
        color: #d69e2e;
        padding: 1.5rem;
        border-radius: 50%;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <i class="fas fa-server" style="font-size: 2.5rem;"></i>
      </div>
      
      <h3 style="
        color: #2d3748; 
        margin-bottom: 1rem;
        font-size: 1.5rem;
        font-weight: 600;
      ">API Server Unavailable</h3>
      
      <p style="
        color: #718096; 
        margin-bottom: 2rem; 
        max-width: 600px;
        line-height: 1.6;
        font-size: 1.1rem;
      ">The backend API server is not responding. This could be because:</p>
      
      <ul style="
        color: #4a5568;
        text-align: left;
        margin-bottom: 2rem;
        max-width: 400px;
        line-height: 1.6;
      ">
        <li>The server is not running</li>
        <li>Network connectivity issues</li>
        <li>API endpoint configuration problems</li>
        <li>Server maintenance in progress</li>
      </ul>
      
      <div style="
        display: flex; 
        gap: 1rem; 
        flex-wrap: wrap; 
        justify-content: center;
        margin-bottom: 2rem;
      ">
        <button 
          class="btn btn-primary" 
          onclick="retryFetchData()"
          style="
            background: linear-gradient(135deg, #3182ce, #2b6cb0);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(49, 130, 206, 0.3);
          "
        >
          <i class="fas fa-refresh"></i>
          Retry Connection
        </button>
        
        <button 
          class="btn btn-secondary" 
          onclick="loadMockData()"
          style="
            background: linear-gradient(135deg, #f6ad55, #ed8936);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(246, 173, 85, 0.3);
          "
        >
          <i class="fas fa-play"></i>
          Try Demo Mode
        </button>
        
        <button 
          class="btn btn-outline" 
          onclick="logout()"
          style="
            background: transparent;
            color: #718096;
            padding: 1rem 2rem;
            border: 2px solid #718096;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transition: all 0.3s ease;
          "
        >
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </div>
  `;
}

// Helper function to show no properties message
function showNoPropertiesMessage() {
  document.getElementById("propertiesGrid").style.display = "none";
  document.getElementById("noPropertiesMessage").style.display = "block";

  // Update stats with zero values
  document.getElementById("totalProperties").textContent = "0";
  document.getElementById("availableUnits").textContent = "0";
  document.getElementById("avgRent").textContent = "N/A";
}
