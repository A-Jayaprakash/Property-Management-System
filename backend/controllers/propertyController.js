const Property = require('../models/Property');
const {validateProperty} = require('../validators/propertyValidator');

// Function to get all properties
const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 });
        res.status(200).json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

// Function to create a new property
const createProperty = async (req, res) => {
    try {
        console.log('Received property data:', req.body);
        
        // Getting all the fields input from the form in UI body
        const { name, address, locality, type, unitCount, createdBy } = req.body;
        
        // Validate the input data using the validator
        const validationError = validateProperty(req.body);
        if (validationError) {
            console.log('Validation error:', validationError);
            return res.status(400).json({ message: validationError });
        }

        // Check if the property already exists (same name and address)
        const existingProperty = await Property.findOne({ 
            name: name.trim(), 
            address: address.trim() 
        });
        
        if (existingProperty) {
            return res.status(400).json({ message: 'Property with this name and address already exists' });
        }

        // Create an instance of the model with the input data
        const property = new Property({
            name: name.trim(),
            address: address.trim(),
            locality: locality?.trim() || '',
            type,
            unitCount: parseInt(unitCount),
            createdBy: createdBy || null // Optional field
        });

        // Save the property to the database
        const savedProperty = await property.save();
        console.log('Property saved successfully:', savedProperty);
        
        // Respond with the created property
        res.status(201).json(savedProperty);

    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ 
            message: 'Internal Server Error', 
            error: error.message,
            details: error.name === 'ValidationError' ? error.errors : undefined
        });
    }
}

// Function to update a property
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        console.log('Updating property:', id, updates);

        // Validate the update data
        const validationError = validateProperty(updates);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // Trim string fields
        if (updates.name) updates.name = updates.name.trim();
        if (updates.address) updates.address = updates.address.trim();
        if (updates.locality) updates.locality = updates.locality.trim();
        if (updates.unitCount) updates.unitCount = parseInt(updates.unitCount);

        // Find the property by ID and update it
        const updatedProperty = await Property.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        );

        if (!updatedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }

        console.log('Property updated successfully:', updatedProperty);
        res.status(200).json(updatedProperty);
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ 
            message: 'Internal Server Error', 
            error: error.message 
        });
    }
}

// Function to delete a property
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Deleting property:', id);

        // Find the property by ID and delete it
        const deletedProperty = await Property.findByIdAndDelete(id);

        if (!deletedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }

        console.log('Property deleted successfully:', deletedProperty.name);
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ 
            message: 'Internal Server Error', 
            error: error.message 
        });
    }
}

// Exporting the functions to be used in routes
module.exports = {
    getAllProperties,
    createProperty,
    updateProperty,
    deleteProperty
};