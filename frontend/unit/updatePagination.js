// Update pagination
function updatePagination() {
  const pagination = document.getElementById("pagination");

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let paginationHTML = "";

  // Previous button
  paginationHTML += `<button ${
    currentPage === 1 ? "disabled" : ""
  } onclick="loadUnits(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="active">${i}</button>`;
    } else {
      paginationHTML += `<button onclick="loadUnits(${i})">${i}</button>`;
    }
  }

  // Next button
  paginationHTML += `<button ${
    currentPage === totalPages ? "disabled" : ""
  } onclick="loadUnits(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>`;

  pagination.innerHTML = paginationHTML;
}
