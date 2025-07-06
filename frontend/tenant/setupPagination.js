// Setup pagination
function setupPagination() {
  const totalPages = Math.ceil(filteredTenants.length / tenantsPerPage);
  const paginationContainer = document.getElementById("pagination");

  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let paginationHTML = "";

  // Previous button
  paginationHTML += `<button ${
    currentPage === 1 ? "disabled" : ""
  } onclick="changePage(${currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </button>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="active">${i}</button>`;
    } else if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
      paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += `<button disabled>...</button>`;
    }
  }

  // Next button
  paginationHTML += `<button ${
    currentPage === totalPages ? "disabled" : ""
  } onclick="changePage(${currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </button>`;

  paginationContainer.innerHTML = paginationHTML;
}
