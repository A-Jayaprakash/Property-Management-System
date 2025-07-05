// Handle search
async function handleSearch() {
  const searchQuery = document.getElementById("searchInput").value.trim();

  if (searchQuery.length === 0) {
    loadUnits(1);
    return;
  }

  try {
    const queryParams = new URLSearchParams({
      query: searchQuery,
    });

    const response = await fetch(
      `${API_BASE_URL}/units/search?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      units = data.units || [];
      displayUnits();
      document.getElementById("pagination").innerHTML = "";
    } else {
      throw new Error("Search failed");
    }
  } catch (error) {
    console.error("Error searching units:", error);
    // Filter mock data for demo
    const filteredUnits = units.filter(
      (unit) =>
        unit.unit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.amenities.some((amenity) =>
          amenity.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    units = filteredUnits;
    displayUnits();
    document.getElementById("pagination").innerHTML = "";
  }
}
