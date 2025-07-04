async function makeAuthenticatedRequest(url, options = {}) {
  if (!isAuthenticated) {
    throw new Error("Not authenticated");
  }

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
      // Token expired or invalid
      logout();
      throw new Error("Authentication expired. Please login again.");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}
