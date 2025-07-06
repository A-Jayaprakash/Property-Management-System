function showLoading() {
  // Add loading states to stat cards
  const statCards = document.querySelectorAll(".stat-card h3");
  statCards.forEach((card) => {
    card.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  });
}
