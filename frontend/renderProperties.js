function renderProperties(propertiesToRender) {
    const container = document.getElementById('propertiesContainer');
    
    if (propertiesToRender.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <h3>No Properties Found</h3>
                <p>Start by adding your first property to the system.</p>
                <button class="btn btn-primary" onclick="openAddModal()">Add New Property</button>
            </div>
        `;
        return;
    }

    container.innerHTML = propertiesToRender.map(property => `
        <div class="property-card">
            <div class="property-header">
                <div>
                    <div class="property-title">${escapeHtml(property.name)}</div>
                </div>
                <div class="property-type">${property.type}</div>
            </div>
            
            <div class="property-details">
                <div class="property-detail">
                    <strong>📍 Address:</strong> ${escapeHtml(property.address)}
                </div>
                ${property.locality ? `
                    <div class="property-detail">
                        <strong>🏘️ Locality:</strong> ${escapeHtml(property.locality)}
                    </div>
                ` : ''}
                <div class="property-detail">
                    <strong>🏠 Units:</strong> ${property.unitCount}
                </div>
                <div class="property-detail">
                    <strong>📅 Created:</strong> ${new Date(property.createdAt).toLocaleDateString()}
                </div>
            </div>
            
            <div class="property-actions">
                <button class="btn btn-warning" onclick="editProperty('${property._id}')">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger" onclick="deleteProperty('${property._id}', '${escapeHtml(property.name)}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}