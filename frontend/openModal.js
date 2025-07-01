function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add New Property';
    document.getElementById('submitBtn').textContent = 'Save Property';
    document.getElementById('propertyForm').reset();
    document.getElementById('propertyModal').style.display = 'block';
}