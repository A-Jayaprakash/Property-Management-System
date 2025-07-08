// Update unit status with improved validation
async function updateUnitStatus(unitId, status) {
  try {
    // Validate unitId
    if (!unitId) {
      throw new Error("Unit ID is required");
    }

    const url = `http://localhost:3000/api/units/${unitId}/status`;
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };

    console.log("Updating unit status:");
    console.log("Unit ID:", unitId);
    console.log("Status:", status);
    console.log("URL:", url);

    const response = await fetch(url, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ status: status.toLowerCase() }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Error response:", errorData);
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("Unit status updated successfully:", result);
    return result;
  } catch (error) {
    console.error("Error updating unit status:", error);
    throw error;
  }
}
