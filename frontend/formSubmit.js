async function handleFormSubmit() {
    const formData = new FormData(document.getElementById('propertyForm'));
    const propertyData = {
        name: formData.get('name'),
        address: formData.get('address'),
        locality: formData.get('locality'),
        type: formData.get('type'),
        unitCount: parseInt(formData.get('unitCount'))
    };

    try {
        let response;
        if (currentEditId) {
            response = await fetch(`${API_BASE_URL}/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propertyData)
            });
        } else {
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(propertyData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save property');
        }

        closeModal();
        loadProperties();
        showSuccess(currentEditId ? 'Property updated successfully!' : 'Property created successfully!');
    } catch (error) {
        console.error('Error saving property:', error);
        showError(error.message);
    }
}