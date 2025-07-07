// Render tenants
function renderTenants() {
  const tenantGrid = document.getElementById("tenantGrid");
  const startIndex = (currentPage - 1) * tenantsPerPage;
  const endIndex = startIndex + tenantsPerPage;
  const currentTenants = filteredTenants.slice(startIndex, endIndex);

  if (currentTenants.length === 0) {
    tenantGrid.innerHTML =
      '<div class="empty-state"><i class="fas fa-search"></i><h3>No tenants found</h3><p>Try adjusting your search or filter criteria.</p></div>';
    return;
  }

  tenantGrid.innerHTML = currentTenants
    .map(
      (tenant) => `
          <div class="tenant-card ${getLeaseStatusClass(tenant)}">
            <div class="tenant-header">
              <div class="tenant-info">
                <h3>${tenant.fullName}</h3>
                <p style="color: #666; margin: 0;">${tenant.email}</p>
              </div>
              <div class="tenant-status status-${tenant.status}">
                ${tenant.status}
              </div>
            </div>
            <div class="tenant-details">
              <div class="detail-row">
                <span class="detail-label">Unit:</span>
                <span class="detail-value">${tenant.assignedUnit}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${tenant.phoneNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Lease End:</span>
                <span class="detail-value">${formatDate(
                  tenant.leaseEndDate
                )}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Monthly Rent:</span>
                <span class="detail-value">${
                  tenant.monthlyRent
                    ? tenant.monthlyRent.toLocaleString()
                    : "N/A"
                }</span>
              </div>
              ${
                getDaysRemaining(tenant.leaseEndDate) <= 30
                  ? `
                <div class="detail-row" style="color: #ff6b6b;">
                  <span class="detail-label">Days Remaining:</span>
                  <span class="detail-value">${getDaysRemaining(
                    tenant.leaseEndDate
                  )} days</span>
                </div>
              `
                  : ""
              }
            </div>
            <div class="tenant-actions">
              <button class="action-btn btn-primary" onclick="editTenant('${
                tenant.id
              }')">
                <i class="fas fa-edit"></i>
                Edit
              </button>
              <button class="action-btn btn-success" onclick="extendLease('${
                tenant.id
              }')">
                <i class="fas fa-calendar-plus"></i>
                Extend Lease
              </button>
              <button class="action-btn btn-warning" onclick="relocateTenant('${
                tenant.id
              }')">
                <i class="fas fa-exchange-alt"></i>
                Relocate
              </button>
              <button class="action-btn btn-danger" onclick="deleteTenant('${
                tenant._id
              }')">
                <i class="fas fa-trash"></i>
                Remove
              </button>
            </div>
          </div>
        `
    )
    .join("");

  setupPagination();
}
