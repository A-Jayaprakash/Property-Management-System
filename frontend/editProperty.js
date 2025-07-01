function editProperty(id) {
    const property = properties.find(p => p._id === id);
    if (!property) return;

    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Property';
    document.getElementById('submitBtn').textContent = 'Update Property';
    
    // Populate form
    document.getElementById('propertyName').value = property.name;
    document.getElementById('propertyAddress').value = property.address;
    document.getElementById('propertyLocality').value = property.locality || '';
    document.getElementById('propertyType').value = property.type;
    document.getElementById('unitCount').value = property.unitCount;
    
    document.getElementById('propertyModal').style.display = 'block';
}