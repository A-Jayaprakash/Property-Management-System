// Enhanced loadProperties function with debugging
async function loadProperties() {
  try {
    console.log("🔍 Loading properties from database...");
    console.log("📡 API URL:", `${API_BASE_URL}/properties`);
    console.log("🔑 Token:", token ? "Present" : "Missing");

    const data = await apiRequest("/properties");
    
    console.log("📥 Raw API Response:", data);
    console.log("📊 Response Type:", typeof data);
    console.log("📋 Response Keys:", Object.keys(data));

    if (data.properties && Array.isArray(data.properties)) {
      properties = data.properties;
      console.log(`✅ Loaded ${properties.length} properties from database`);
      console.log("🏠 Properties Array:", properties);
    } else if (Array.isArray(data)) {
      // Sometimes API returns array directly
      properties = data;
      console.log(`✅ Loaded ${properties.length} properties (direct array)`);
      console.log("🏠 Properties Array:", properties);
    } else {
      properties = [];
      console.warn("⚠️ No properties found in database");
      console.warn("Expected 'properties' array in response, got:", data);
    }

    populatePropertyDropdowns();
    
    // Additional debugging for dropdowns
    console.log("🔽 Property dropdown populated");
    const propertySelect = document.getElementById("property");
    console.log("🔽 Property select options count:", propertySelect.options.length);
    
  } catch (error) {
    console.error("❌ Error loading properties:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack
    });

    // Show user-friendly error message
    const errorMessage = error.message.includes("Authentication failed")
      ? "Session expired. Please login again."
      : "Failed to load properties. Please try refreshing the page.";

    // Show error notification
    showNotification(errorMessage, "error");

    // Set empty properties array
    properties = [];
    populatePropertyDropdowns();
  }
}

// Enhanced populatePropertyDropdowns with debugging
function populatePropertyDropdowns() {
  console.log("🔄 Populating property dropdowns...");
  console.log("📦 Properties available:", properties.length);
  
  const propertyFilter = document.getElementById("propertyFilter");
  const propertySelect = document.getElementById("property");

  // Clear existing options
  propertyFilter.innerHTML = '<option value="">All Properties</option>';
  propertySelect.innerHTML = '<option value="">Select Property</option>';

  if (properties.length === 0) {
    console.log("⚠️ No properties to populate in dropdowns");
    return;
  }

  properties.forEach((property, index) => {
    console.log(`🏠 Processing property ${index + 1}:`, property);
    
    // Check if property has required fields
    if (!property._id || !property.name) {
      console.warn("⚠️ Property missing required fields:", property);
      return;
    }

    const option1 = document.createElement("option");
    option1.value = property._id;
    option1.textContent = property.name;
    propertyFilter.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = property._id;
    option2.textContent = property.name;
    propertySelect.appendChild(option2);
  });
  
  console.log("✅ Property dropdowns populated");
  console.log("🔽 Filter options:", propertyFilter.options.length);
  console.log("🔽 Select options:", propertySelect.options.length);
}