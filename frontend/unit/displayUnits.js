// Display units
function displayUnits() {
  const unitsGrid = document.getElementById("unitsGrid");

  if (units.length === 0) {
    unitsGrid.innerHTML = `
                    <div class="no-units">
                        <i class="fas fa-home"></i>
                        <h3>No Units Found</h3>
                        <p>Try adjusting your search criteria or add a new unit.</p>
                    </div>
                `;
    return;
  }

  unitsGrid.innerHTML = units
    .map(
      (unit) => `
                <div class="unit-card">
                    <div class="unit-header">
                        <div class="unit-number">${unit.unit_number}</div>
                        <div class="status-badge status-${unit.status}">${
        unit.status
      }</div>
                    </div>
                    
                    <div class="unit-details">
                        <div class="unit-detail-row">
                            <span class="unit-detail-label">Property:</span>
                            <span class="unit-detail-value">${
                              unit.property?.name || "N/A"
                            }</span>
                        </div>
                        <div class="unit-detail-row">
                            <span class="unit-detail-label">Type:</span>
                            <span class="unit-detail-value">${unit.type}</span>
                        </div>
                        <div class="unit-detail-row">
                            <span class="unit-detail-label">Area:</span>
                            <span class="unit-detail-value">${unit.area} ${
        unit.area_unit
      }</span>
                        </div>
                        <div class="unit-detail-row">
                            <span class="unit-detail-label">Floor:</span>
                            <span class="unit-detail-value">${unit.floor}</span>
                        </div>
                        <div class="unit-detail-row">
                            <span class="unit-detail-label">Rent:</span>
                            <span class="unit-detail-value">₹${unit.rent?.toLocaleString()}</span>
                        </div>
                        <div class="unit-detail-row">
                            <span class="unit-detail-label">Security Deposit:</span>
                            <span class="unit-detail-value">₹${unit.security_deposit?.toLocaleString()}</span>
                        </div>
                        ${
                          unit.current_tenant
                            ? `
                            <div class="unit-detail-row">
                                <span class="unit-detail-label">Tenant:</span>
                                <span class="unit-detail-value">${unit.current_tenant.name}</span>
                            </div>
                        `
                            : ""
                        }
                    </div>
                    
                    ${
                      unit.amenities && unit.amenities.length > 0
                        ? `
                        <div class="amenities-list">
                            ${unit.amenities
                              .map(
                                (amenity) =>
                                  `<span class="amenity-tag">${amenity}</span>`
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                    
                    <div class="unit-actions">
                        <button class="btn btn-primary" onclick="editUnit('${
                          unit._id
                        }')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-warning" onclick="updateUnitStatus('${
                          unit._id
                        }', '${unit.status}')">
                            <i class="fas fa-sync"></i> Status
                        </button>
                        <button class="btn btn-danger" onclick="deleteUnit('${
                          unit._id
                        }')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `
    )
    .join("");
}
