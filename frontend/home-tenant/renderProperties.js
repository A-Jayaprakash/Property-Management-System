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

      // FIX: Check for available units more accurately
      const isAvailable = availableUnits.length > 0;

      // Debug logging to help identify the issue
      console.log(`Property ${property.name}:`, {
        hasUnits,
        totalUnits: property.units ? property.units.length : 0,
        availableUnits: availableUnits.length,
        unitStatuses: property.units ? property.units.map((u) => u.status) : [],
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
                        property.type.charAt(0).toUpperCase() +
                        property.type.slice(1)
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
                          ? `$${minRent.toLocaleString()}/month`
                          : `$${minRent.toLocaleString()} - $${maxRent.toLocaleString()}/month`
                      }
                    </div>
                  `
                      : ""
                  }
                  <div class="property-description">
                    Property with ${property.totalUnits} units.
                  </div>
                  <div class="property-description">
                     ${
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
                            <span class="unit-details">${unit.bedrooms}BR/${
                              unit.bathrooms
                            }BA</span>
                            <span class="unit-rent">$${unit.rent.toLocaleString()}/mo</span>
                          </div>
                        `
                          )
                          .join("")}
                        ${
                          availableUnits.length > 3
                            ? `
                          <div class="unit-item more-units">
                            <span>+${
                              availableUnits.length - 3
                            } more units</span>
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
                      availableUnits.length > 0
                        ? "btn-primary"
                        : "btn-secondary"
                    }" 
                            ${
                              availableUnits.length > 0
                                ? `onclick="contactProperty('${property._id}')"`
                                : "disabled"
                            }>
                      <i class="fas ${
                        availableUnits.length > 0 ? "fa-envelope" : "fa-ban"
                      }"></i>
                      ${
                        availableUnits.length > 0
                          ? "Contact"
                          : "No Units Available"
                      }
                    </button>
                  </div>
                </div>
              </div>
            `;
    })
    .join("");
}
