// Populate property select dropdown
function populatePropertySelect() {
  const propertySelect = document.getElementById("propertySelect");
  propertySelect.innerHTML = '<option value="">Select a property...</option>';

  properties.forEach((property) => {
    const option = document.createElement("option");
    option.value = property.id;
    option.textContent = `${property.name} - ${property.address}`;
    propertySelect.appendChild(option);
  });
}
