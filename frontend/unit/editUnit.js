// Edit unit
function editUnit(unitId) {
  const unit = units.find((u) => u._id === unitId);
  if (!unit) return;

  editingUnitId = unitId;
  document.getElementById("modalTitle").textContent = "Edit Unit";

  // Populate form
  document.getElementById("unit_number").value = unit.unit_number;
  document.getElementById("property").value = unit.property?._id || "";
  document.getElementById("type").value = unit.type;
  document.getElementById("area").value = unit.area;
  document.getElementById("area_unit").value = unit.area_unit;
  document.getElementById("floor").value = unit.floor;
  document.getElementById("rent").value = unit.rent;
  document.getElementById("security_deposit").value = unit.security_deposit;
  document.getElementById("maintenance_fee").value = unit.maintenance_fee || 0;
  document.getElementById("description").value = unit.description || "";

  // Set amenities
  const amenityCheckboxes = document.querySelectorAll(
    'input[name="amenities"]'
  );
  amenityCheckboxes.forEach((checkbox) => {
    checkbox.checked = unit.amenities?.includes(checkbox.value) || false;
  });

  document.getElementById("unitModal").style.display = "block";
}
