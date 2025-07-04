function renderProperties(propertiesToRender) {
  const container = document.getElementById("propertiesContainer");

  // Get user role from userData
  const userRole = window.userData?.user?.role || "tenant";
  const currentUserId = window.userData?.user?.id;

  if (propertiesToRender.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <h3>No Properties Found</h3>
                <p>Start by adding your first property to the system.</p>
                ${
                  userRole !== "tenant"
                    ? '<button class="btn btn-primary" onclick="openAddModal()">Add New Property</button>'
                    : ""
                }
            </div>
        `;
    return;
  }

  container.innerHTML = propertiesToRender
    .map((property) => {
      // Check if current user can edit/delete this property
      const canEdit =
        userRole === "admin" ||
        (userRole === "manager" && property.createdBy === currentUserId);
      const canDelete =
        userRole === "admin" ||
        (userRole === "manager" && property.createdBy === currentUserId);

      return `
            <div class="property-card">
                <div class="property-header">
                    <div>
                        <div class="property-title">${escapeHtml(
                          property.name
                        )}</div>
                        ${
                          userRole === "admin" || userRole === "manager"
                            ? `<div class="property-creator">
                                <small>Created by: ${
                                  property.createdBy === currentUserId
                                    ? "You"
                                    : "Another user"
                                }</small>
                            </div>`
                            : ""
                        }
                    </div>
                    <div class="property-type">${property.type}</div>
                </div>
                
                <div class="property-details">
                    <div class="property-detail">
                        <strong>📍 Address:</strong> ${escapeHtml(
                          property.address
                        )}
                    </div>
                    ${
                      property.locality
                        ? `
                        <div class="property-detail">
                            <strong>🏘️ Locality:</strong> ${escapeHtml(
                              property.locality
                            )}
                        </div>
                    `
                        : ""
                    }
                    <div class="property-detail">
                        <strong>🏠 Units:</strong> ${property.unitCount}
                    </div>
                    <div class="property-detail">
                        <strong>📅 Created:</strong> ${new Date(
                          property.createdAt
                        ).toLocaleDateString()}
                    </div>
                </div>
                
                ${
                  userRole !== "tenant"
                    ? `
                    <div class="property-actions">
                        ${
                          canEdit
                            ? `
                            <button class="btn btn-warning" onclick="editProperty('${property._id}')">
                                ✏️ Edit
                            </button>
                        `
                            : `
                            <button class="btn btn-warning" disabled title="You can only edit properties you created">
                                ✏️ Edit
                            </button>
                        `
                        }
                        ${
                          canDelete
                            ? `
                            <button class="btn btn-danger" onclick="deleteProperty('${
                              property._id
                            }', '${escapeHtml(property.name)}')">
                                🗑️ Delete
                            </button>
                        `
                            : `
                            <button class="btn btn-danger" disabled title="You can only delete properties you created">
                                🗑️ Delete
                            </button>
                        `
                        }
                    </div>
                `
                    : `
                    <div class="property-actions">
                        <div class="tenant-notice">
                            <small>👁️ View Only - Contact admin/manager for changes</small>
                        </div>
                    </div>
                `
                }
            </div>
        `;
    })
    .join("");
}
