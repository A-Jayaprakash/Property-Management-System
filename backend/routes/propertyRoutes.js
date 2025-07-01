const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// GET Request to fetch all preoperties
// This will be called when the user visits the properties page
router.get('/', propertyController.getAllProperties);

// POST Request to create a new property
// This will be called when the user submits the form to create a new property
router.post('/', propertyController.createProperty);

// PUT Request to update a property
// This will be called when the user submits the form to update a property
router.put('/:id', propertyController.updateProperty);

// DELETE Request to delete a property
// This will be called when the user clicks on the delete button for a property
router.delete('/:id', propertyController.deleteProperty);

// Exporting the router module
module.exports = router;