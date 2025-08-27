async function makeAuthenticatedRequest(endpoint, options = {}) {
  if (!isAuthenticated) {
    throw new Error("Not authenticated");
  }

  const url = `${API_BASE_URL}${endpoint}`; // Build full URL

  const defaultOptions = {
    headers: getAuthHeaders(),
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error("Authentication expired. Please login again.");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}
