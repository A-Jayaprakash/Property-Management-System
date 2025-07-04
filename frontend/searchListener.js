function setupSearchListener() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase().trim();

      if (!isAuthenticated) {
        console.log("Not authenticated, cannot search");
        return;
      }

      if (searchTerm === "") {
        renderProperties(properties);
      } else {
        const filteredProperties = properties.filter(
          (property) =>
            property.name.toLowerCase().includes(searchTerm) ||
            property.address.toLowerCase().includes(searchTerm) ||
            property.locality.toLowerCase().includes(searchTerm) ||
            property.type.toLowerCase().includes(searchTerm)
        );
        renderProperties(filteredProperties);
      }
    });
  }
}
