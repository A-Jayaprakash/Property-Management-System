// Populate property dropdowns
function populatePropertyDropdowns() {
  const propertyFilter = document.getElementById("propertyFilter");
  const propertySelect = document.getElementById("property");

  // Clear existing options
  propertyFilter.innerHTML = '<option value="">All Properties</option>';
  propertySelect.innerHTML = '<option value="">Select Property</option>';

  properties.forEach((property) => {
    const option1 = document.createElement("option");
    option1.value = property._id;
    option1.textContent = property.name;
    propertyFilter.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = property._id;
    option2.textContent = property.name;
    propertySelect.appendChild(option2);
  });
}
