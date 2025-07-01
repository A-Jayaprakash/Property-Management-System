function setupFormListener() {
    const form = document.getElementById('propertyForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });
}