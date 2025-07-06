function showErrorMessage(message) {
  const propertiesGrid = document.getElementById("propertiesGrid");
  propertiesGrid.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error Loading Data</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="fetchPropertiesAndUnits()">
              <i class="fas fa-refresh"></i>
              Retry
            </button>
          </div>
        `;
}
