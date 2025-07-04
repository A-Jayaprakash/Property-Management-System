function filterProperties(searchTerm) {
    if (!searchTerm) {
        renderProperties(properties);
        return;
    }

    const filtered = properties.filter(property => 
        property.name.toLowerCase().includes(searchTerm) ||
        property.address.toLowerCase().includes(searchTerm) ||
        property.locality?.toLowerCase().includes(searchTerm) ||
        property.type.toLowerCase().includes(searchTerm)
    );

    renderProperties(filtered);
}