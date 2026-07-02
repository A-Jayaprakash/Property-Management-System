// Holds the tenant currently being reactivated
let reactivatingTenant = null;

async function reactivateTenant(tenantId) {
  const tenant = tenants.find((t) => (t._id || t.id) === tenantId);
  if (!tenant) return;

  if (tenant.status === "Active") {
    showNotification("This tenant is already active.", "info");
    return;
  }

  reactivatingTenant = tenant;

  // Resolve property ObjectId (populated object or plain string)
  const propertyId =
    tenant.propertyId && typeof tenant.propertyId === "object"
      ? tenant.propertyId._id || tenant.propertyId.id
      : tenant.propertyId;

  document.getElementById("reactivateInfo").textContent =
    `Reactivating ${tenant.fullName}. Select an available unit to assign them to.`;

  const unitSelect = document.getElementById("reactivateUnitSelect");
  unitSelect.innerHTML = '<option value="">Loading available units…</option>';

  document.getElementById("reactivateModal").classList.add("active");

  // Fetch available units for this tenant's property
  try {
    const url = propertyId
      ? `${API_BASE_URL}/api/units?property=${propertyId}&status=available`
      : `${API_BASE_URL}/api/units?status=available`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    const unitList = Array.isArray(data) ? data : data.units || [];

    if (unitList.length === 0) {
      unitSelect.innerHTML =
        '<option value="">No available units in this property</option>';
    } else {
      unitSelect.innerHTML = '<option value="">— Select a unit —</option>';
      unitList.forEach((unit) => {
        const opt = document.createElement("option");
        opt.value = unit._id || unit.id;
        opt.dataset.unitNumber = unit.unit_number;
        opt.textContent = `${unit.unit_number} — ${unit.type} · Floor ${unit.floor} · ₹${(unit.rent || 0).toLocaleString()}/mo`;
        unitSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Failed to load units for reactivation:", err);
    unitSelect.innerHTML =
      '<option value="">Failed to load units — try refreshing</option>';
  }
}

function closeReactivateModal() {
  document.getElementById("reactivateModal").classList.remove("active");
  reactivatingTenant = null;
}

async function confirmReactivate() {
  if (!reactivatingTenant) return;

  const unitSelect = document.getElementById("reactivateUnitSelect");
  const unitId = unitSelect.value;
  const selectedOption = unitSelect.options[unitSelect.selectedIndex];
  const assignedUnit = selectedOption?.dataset?.unitNumber;

  if (!unitId || !assignedUnit) {
    showNotification("Please select a unit before confirming.", "error");
    return;
  }

  const btn = document.getElementById("confirmReactivateBtn");
  btn.disabled = true;
  btn.textContent = "Reactivating…";

  const tenantId = reactivatingTenant._id || reactivatingTenant.id;

  try {
    // 1. Set tenant Active + assign unit
    const res = await fetch(
      `${API_BASE_URL}/api/tenants/${tenantId}/reactivate`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ unitId, assignedUnit }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || "Failed to reactivate tenant");
    }

    // 2. Mark the unit as occupied
    const unitRes = await fetch(
      `${API_BASE_URL}/api/units/${unitId}/status`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: "occupied" }),
      }
    );
    if (!unitRes.ok) {
      const unitErr = await unitRes.json().catch(() => null);
      showNotification(
        `Tenant reactivated but unit status update failed: ${
          unitErr?.message || "unknown error"
        }. Update it manually from the Unit page.`,
        "warning"
      );
    }

    // 3. Update local state
    const idx = tenants.findIndex((t) => (t._id || t.id) === tenantId);
    if (idx !== -1) {
      tenants[idx] = { ...tenants[idx], status: "Active", unitId, assignedUnit };
    }
    filteredTenants = [...tenants];

    // Capture name before closeReactivateModal() nulls the reference
    const tenantName = reactivatingTenant.fullName;
    closeReactivateModal();
    renderTenants();
    updateStats();
    showNotification(
      `${tenantName} reactivated and assigned to unit ${assignedUnit}.`,
      "success"
    );
  } catch (err) {
    console.error("Error reactivating tenant:", err);
    showNotification(err.message || "Failed to reactivate tenant", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> Reactivate';
  }
}
