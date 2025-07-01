async function deleteProperty(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete property');
        }

        loadProperties();
        showSuccess('Property deleted successfully!');
    } catch (error) {
        console.error('Error deleting property:', error);
        showError(error.message);
    }
}