async function loadProperties() {
    try {
        showLoading(true);
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        properties = await response.json();
        renderProperties(properties);
        showSuccess('Properties loaded successfully');
    } catch (error) {
        console.error('Error loading properties:', error);
        showError('Failed to load properties. Please check if the server is running.');
    } finally {
        showLoading(false);
    }
}