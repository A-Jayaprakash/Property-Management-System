// Enhanced showErrorMessage.js with better UI and retry functionality
function showErrorMessage(message) {
  const propertiesGrid = document.getElementById("propertiesGrid");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const noPropertiesMessage = document.getElementById("noPropertiesMessage");

  // Hide loading spinner and other elements
  loadingSpinner.style.display = "none";
  noPropertiesMessage.style.display = "none";
  propertiesGrid.style.display = "block";

  // Determine error type for better messaging
  let errorType = "general";
  let errorIcon = "fas fa-exclamation-triangle";
  let errorColor = "#c53030";
  let errorBg = "#fee";

  if (message.includes("connect") || message.includes("fetch")) {
    errorType = "connection";
    errorIcon = "fas fa-wifi";
    errorColor = "#d69e2e";
    errorBg = "#fef5e7";
  } else if (message.includes("authentication") || message.includes("login")) {
    errorType = "auth";
    errorIcon = "fas fa-lock";
    errorColor = "#9f1239";
    errorBg = "#fef2f2";
  } else if (message.includes("server") || message.includes("API")) {
    errorType = "server";
    errorIcon = "fas fa-server";
    errorColor = "#b91c1c";
    errorBg = "#fef2f2";
  }

  propertiesGrid.innerHTML = `
    <div class="error-message-container" style="
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
      margin: 2rem 0;
      min-height: 400px;
    ">
      <div style="
        background: ${errorBg};
        color: ${errorColor};
        padding: 1.5rem;
        border-radius: 50%;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <i class="${errorIcon}" style="font-size: 2.5rem;"></i>
      </div>
      
      <h3 style="
        color: #2d3748; 
        margin-bottom: 1rem;
        font-size: 1.5rem;
        font-weight: 600;
      ">Error Loading Data</h3>
      
      <p style="
        color: #718096; 
        margin-bottom: 2rem; 
        max-width: 600px;
        line-height: 1.6;
        font-size: 1.1rem;
      ">${message}</p>
      
      <div style="
        display: flex; 
        gap: 1rem; 
        flex-wrap: wrap; 
        justify-content: center;
        margin-bottom: 2rem;
      ">
        <button 
          class="btn btn-primary retry-btn" 
          onclick="retryFetchData()"
          style="
            background: linear-gradient(135deg, #3182ce, #2b6cb0);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(49, 130, 206, 0.3);
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(49, 130, 206, 0.4)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(49, 130, 206, 0.3)'"
        >
          <i class="fas fa-refresh"></i>
          Retry
        </button>
        
        <button 
          class="btn btn-secondary" 
          onclick="logout()"
          style="
            background: linear-gradient(135deg, #718096, #4a5568);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(113, 128, 150, 0.3);
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(113, 128, 150, 0.4)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(113, 128, 150, 0.3)'"
        >
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
      
      <div style="
        max-width: 500px;
        padding: 1.5rem;
        background: #f7fafc;
        border-radius: 8px;
        border-left: 4px solid #3182ce;
      ">
        <h4 style="
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
        ">Troubleshooting Tips:</h4>
        <ul style="
          color: #4a5568;
          text-align: left;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          padding-left: 1.5rem;
        ">
          <li>Check your internet connection</li>
          <li>Ensure the backend API server is running</li>
          <li>Verify the API endpoints are accessible</li>
          <li>Try refreshing the page</li>
          <li>Contact support if the issue persists</li>
        </ul>
      </div>
    </div>
  `;
}

// Enhanced retry function with loading state
function retryFetchData() {
  const retryBtn = document.querySelector(".retry-btn");
  if (retryBtn) {
    retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrying...';
    retryBtn.disabled = true;
  }

  // Add a small delay to show the loading state
  setTimeout(() => {
    fetchPropertiesAndUnits();
  }, 1000);
}
