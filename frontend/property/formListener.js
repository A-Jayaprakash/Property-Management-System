function setupFormListener() {
  const form = document.getElementById("propertyForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleFormSubmit();
    });
  }
}
