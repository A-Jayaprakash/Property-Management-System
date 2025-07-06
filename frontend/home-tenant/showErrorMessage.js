function showErrorMessage(message) {
  const propertiesGrid = document.getElementById("propertiesGrid");
  const loadingSpinner = document.getElementById("loadingSpinner");

  // Hide loading spinner
  loadingSpinner.style.display = "none";

  propertiesGrid.innerHTML = `
    <div class="error-message" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
      margin: 2rem 0;
    ">
      <div style="
        background: #fee;
        color: #c53030;
        padding: 1rem;
        border-radius: 50%;
        margin-bottom: 1rem;
      ">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem;"></i>
      </div>
      <h3 style="color: #2d3748; margin-bottom: 1rem;">Error Loading Data</h3>
      <p style="color: #718096; margin-bottom: 2rem; max-width: 500px;">${message}</p>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
        <button class="btn btn-primary" onclick="fetchPropertiesAndUnits()" style="
          background: #3182ce;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        ">
          <i class="fas fa-refresh"></i>
          Retry
        </button>
        <button class="btn btn-secondary" onclick="logout()" style="
          background: #718096;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        ">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
      <div style="margin-top: 2rem; font-size: 0.875rem; color: #a0aec0;">
        <p>If the problem persists, please contact support or check your internet connection.</p>
      </div>
    </div>
  `;
}
