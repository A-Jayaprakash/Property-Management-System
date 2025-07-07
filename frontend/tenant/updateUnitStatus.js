// Update unit status with debugging
async function updateUnitStatus(unitId, status) {
  try {
    const url = `http://localhost:3000/api/units/${unitId}/status`;
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };

    console.log("Making PATCH request to:", url);
    console.log("Headers:", headers);
    console.log("Body:", JSON.stringify({ status }));

    const response = await fetch(url, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ status }),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

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
