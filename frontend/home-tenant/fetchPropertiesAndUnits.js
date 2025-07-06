// Enhanced debug version with CORS fix
async function fetchPropertiesAndUnits(forceRefresh = false) {
  try {
    document.getElementById("loadingSpinner").style.display = "block";
    document.getElementById("propertiesGrid").style.display = "none";
    document.getElementById("noPropertiesMessage").style.display = "none";

    const headers = getAuthHeaders();

    // FIXED: Remove cache-control headers that cause CORS issues
    // Instead, use URL parameter for cache busting
    console.log("=== STARTING DATA FETCH ===");
    console.log("Auth headers:", headers);

    // Check if we have a valid token
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found");
      showErrorMessage("Authentication required. Please login again.");
      setTimeout(() => logout(), 2000);
      return;
    }

    // Add timestamp to prevent caching (this is sufficient for cache busting)
    const timestamp = forceRefresh ? new Date().getTime() : Date.now();
    const propertiesUrl = `http://localhost:3000/api/properties?t=${timestamp}${
      forceRefresh ? "&refresh=true" : ""
    }`;
    const unitsUrl = `http://localhost:3000/api/units?t=${timestamp}${
      forceRefresh ? "&refresh=true" : ""
    }`;

    console.log("Fetching from URLs:", { propertiesUrl, unitsUrl });

    // Fetch properties with simplified headers
    const propertiesResponse = await fetch(propertiesUrl, {
      method: "GET",
      headers: headers,
      // Add mode to handle CORS properly
      mode: "cors",
      credentials: "include",
    });

    console.log("Properties response status:", propertiesResponse.status);

    if (!propertiesResponse.ok) {
      const errorText = await propertiesResponse.text();
      console.error("Properties fetch error:", errorText);
      throw new Error(
        `Failed to fetch properties: ${propertiesResponse.status} - ${errorText}`
      );
    }

    const propertiesData = await propertiesResponse.json();
    console.log("=== RAW PROPERTIES DATA ===");
    console.log(JSON.stringify(propertiesData, null, 2));

    // Handle different response formats
    if (propertiesData.success !== undefined) {
      allProperties = Array.isArray(propertiesData.data)
        ? propertiesData.data
        : [];
    } else if (propertiesData.properties) {
      allProperties = Array.isArray(propertiesData.properties)
        ? propertiesData.properties
        : [];
    } else {
      allProperties = Array.isArray(propertiesData) ? propertiesData : [];
    }

    console.log("=== PARSED PROPERTIES ===");
    allProperties.forEach((prop, index) => {
      console.log(`Property ${index + 1}:`, {
        id: prop._id,
        name: prop.name,
        address: prop.address,
        locality: prop.locality,
        type: prop.type,
        unitCount: prop.unitCount,
        createdAt: prop.createdAt,
      });
    });

    // Fetch units with simplified headers
    try {
      console.log("Fetching units...");
      const unitsResponse = await fetch(unitsUrl, {
        method: "GET",
        headers: headers,
        mode: "cors",
        credentials: "include",
      });

      console.log("Units response status:", unitsResponse.status);

      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        console.log("=== RAW UNITS DATA ===");
        console.log(JSON.stringify(unitsData, null, 2));

        // Handle different response formats for units
        let rawUnits = [];
        if (unitsData.success !== undefined) {
          rawUnits = Array.isArray(unitsData.data) ? unitsData.data : [];
        } else if (unitsData.units) {
          rawUnits = Array.isArray(unitsData.units) ? unitsData.units : [];
        } else {
          rawUnits = Array.isArray(unitsData) ? unitsData : [];
        }

        // FIXED: Parse units with correct field names from API response
        allUnits = rawUnits.map((unit) => ({
          id: unit._id,
          unitNumber: unit.unit_number, // FIXED: Use unit_number from API
          status: unit.status,
          rent: unit.rent,
          propertyId: unit.property._id, // FIXED: Use unit.property._id from API
          propertyName: unit.property.name,
          propertyAddress: unit.property.address,
          type: unit.type,
          area: unit.area,
          areaUnit: unit.area_unit,
          floor: unit.floor,
          securityDeposit: unit.security_deposit,
          amenities: unit.amenities,
          description: unit.description,
          maintenanceFee: unit.maintenance_fee,
          isActive: unit.is_active,
          leaseTerms: unit.lease_terms,
          utilities: unit.utilities,
          bedrooms: unit.type ? parseInt(unit.type.charAt(0)) || 1 : 1, // Extract bedroom count from type
          bathrooms: unit.type
            ? Math.ceil(parseInt(unit.type.charAt(0)) / 2) || 1
            : 1, // Estimate bathroom count
          createdAt: unit.createdAt,
          updatedAt: unit.updatedAt,
        }));

        console.log("=== PARSED UNITS (FIXED) ===");
        allUnits.forEach((unit, index) => {
          console.log(`Unit ${index + 1}:`, {
            id: unit.id,
            unitNumber: unit.unitNumber,
            status: unit.status,
            rent: unit.rent,
            propertyId: unit.propertyId,
            propertyName: unit.propertyName,
            type: unit.type,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
          });
        });
      } else {
        console.log(
          "Units endpoint not available or error:",
          unitsResponse.status
        );
        allUnits = [];
      }
    } catch (error) {
      console.log("Error fetching units:", error);
      allUnits = [];
    }

    console.log("=== PROPERTY-UNIT MAPPING ANALYSIS ===");

    // Combine properties with their units
    const propertiesWithUnits = allProperties.map((property) => {
      console.log(
        `\n--- Analyzing Property: ${property.name} (ID: ${property._id}) ---`
      );

      // FIXED: Use the correct propertyId field
      const propertyUnits = allUnits.filter((unit) => {
        const matches = unit.propertyId === property._id;

        if (matches) {
          console.log(
            `  ✓ Unit ${unit.unitNumber} matches property ${property.name}`
          );
        }
        return matches;
      });

      console.log(`  Total units found: ${propertyUnits.length}`);

      if (propertyUnits.length > 0) {
        console.log("  Unit details:");
        propertyUnits.forEach((unit) => {
          console.log(
            `    - ${unit.unitNumber}: ${unit.status} (Rent: ₹${unit.rent})`
          );
        });
      }

      const availableUnitsCount = propertyUnits.filter(
        (unit) => unit.status === "available"
      ).length;

      console.log(`  Available units: ${availableUnitsCount}`);

      return {
        ...property,
        units: propertyUnits,
        availableUnits: availableUnitsCount,
        totalUnits: propertyUnits.length || property.unitCount || 1,
      };
    });

    console.log("=== FINAL ANALYSIS ===");
    propertiesWithUnits.forEach((property) => {
      console.log(
        `${property.name}: ${property.availableUnits}/${property.totalUnits} available`
      );
    });

    filteredProperties = propertiesWithUnits;

    if (filteredProperties.length === 0) {
      showNoPropertiesMessage();
    } else {
      updateStats();
      renderProperties(filteredProperties);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    showErrorMessage(
      `Failed to load properties and units. Error: ${error.message}`
    );
  } finally {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("propertiesGrid").style.display = "grid";
  }
}

// Enhanced render function with proper currency formatting
function renderProperties(properties) {
  const propertiesGrid = document.getElementById("propertiesGrid");
  const noPropertiesMessage = document.getElementById("noPropertiesMessage");

  if (properties.length === 0) {
    propertiesGrid.style.display = "none";
    noPropertiesMessage.style.display = "block";
    return;
  }

  propertiesGrid.style.display = "grid";
  noPropertiesMessage.style.display = "none";

  propertiesGrid.innerHTML = properties
    .map((property) => {
      const hasUnits = property.units && property.units.length > 0;
      const availableUnits = hasUnits
        ? property.units.filter((unit) => unit.status === "available")
        : [];
      const isAvailable = availableUnits.length > 0;

      console.log(`Rendering ${property.name}:`, {
        hasUnits,
        totalUnits: property.units ? property.units.length : 0,
        availableUnits: availableUnits.length,
        unitStatuses: property.units
          ? property.units.map((u) => ({
              number: u.unitNumber,
              status: u.status,
            }))
          : [],
        isAvailable,
      });

      const minRent =
        hasUnits && availableUnits.length > 0
          ? Math.min(...availableUnits.map((unit) => unit.rent || 0))
          : null;
      const maxRent =
        hasUnits && availableUnits.length > 0
          ? Math.max(...availableUnits.map((unit) => unit.rent || 0))
          : null;

      return `
        <div class="property-card slide-in">
          <div class="property-image">
            <i class="fas fa-building"></i>
            <div class="property-status ${
              isAvailable ? "available" : "occupied"
            }">
              ${isAvailable ? "Available" : "Fully Occupied"}
            </div>
          </div>
          <div class="property-content">
            <div class="property-title">${property.name}</div>
            <div class="property-details">
              <div class="property-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span>${property.address}</span>
              </div>
              ${
                property.locality
                  ? `
                <div class="property-detail">
                  <i class="fas fa-location-dot"></i>
                  <span>${property.locality}</span>
                </div>
              `
                  : ""
              }
              <div class="property-detail">
                <i class="fas fa-home"></i>
                <span>${
                  property.type.charAt(0).toUpperCase() + property.type.slice(1)
                }</span>
              </div>
              <div class="property-detail">
                <i class="fas fa-door-open"></i>
                <span>${property.totalUnits} Total Units</span>
              </div>
              <div class="property-detail">
                <i class="fas fa-check-circle"></i>
                <span>${availableUnits.length} Available</span>
              </div>
              <div class="property-detail">
                <i class="fas fa-calendar-alt"></i>
                <span>Added ${new Date(
                  property.createdAt
                ).toLocaleDateString()}</span>
              </div>
            </div>
            ${
              minRent && maxRent
                ? `
              <div class="property-price">
                ${
                  minRent === maxRent
                    ? `₹${minRent.toLocaleString()}/month`
                    : `₹${minRent.toLocaleString()} - ₹${maxRent.toLocaleString()}/month`
                }
              </div>
            `
                : ""
            }
            <div class="property-description">
              Property with ${property.totalUnits} units. ${
        availableUnits.length
      } units currently available for rent.
            </div>
            
            ${
              hasUnits && availableUnits.length > 0
                ? `
              <div class="available-units">
                <h4>Available Units:</h4>
                <div class="units-list">
                  ${availableUnits
                    .slice(0, 3)
                    .map(
                      (unit) => `
                    <div class="unit-item">
                      <span class="unit-number">${unit.unitNumber}</span>
                      <span class="unit-details">${unit.type} - ${unit.area} ${
                        unit.areaUnit
                      }</span>
                      <span class="unit-rent">₹${unit.rent.toLocaleString()}/mo</span>
                    </div>
                  `
                    )
                    .join("")}
                  ${
                    availableUnits.length > 3
                      ? `
                    <div class="unit-item more-units">
                      <span>+${availableUnits.length - 3} more units</span>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            `
                : ""
            }
            
            <div class="property-actions">
              <button class="btn btn-outline" onclick="viewPropertyDetails('${
                property._id
              }')">
                <i class="fas fa-eye"></i>
                View Details
              </button>
              <button class="btn ${
                availableUnits.length > 0 ? "btn-primary" : "btn-secondary"
              }" 
                      ${
                        availableUnits.length > 0
                          ? `onclick="contactProperty('${property._id}')"`
                          : "disabled"
                      }>
                <i class="fas ${
                  availableUnits.length > 0 ? "fa-envelope" : "fa-ban"
                }"></i>
                ${availableUnits.length > 0 ? "Contact" : "No Units Available"}
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Improved refresh button with better error handling
function addRefreshButton() {
  const container = document.querySelector(".tenant-stats");
  if (container && !document.getElementById("refreshButton")) {
    const refreshButton = document.createElement("button");
    refreshButton.id = "refreshButton";
    refreshButton.className = "btn btn-primary";
    refreshButton.innerHTML = '<i class="fas fa-refresh"></i> Refresh Data';
    refreshButton.onclick = async () => {
      try {
        refreshButton.disabled = true;
        refreshButton.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        await fetchPropertiesAndUnits(true);
      } catch (error) {
        console.error("Refresh error:", error);
        showErrorMessage("Failed to refresh data. Please try again.");
      } finally {
        refreshButton.disabled = false;
        refreshButton.innerHTML = '<i class="fas fa-refresh"></i> Refresh Data';
      }
    };
    refreshButton.style.marginTop = "1rem";
    container.appendChild(refreshButton);
  }
}

// Call this when the page loads
document.addEventListener("DOMContentLoaded", addRefreshButton);
