const Property = require('../../models/Property');
const {validateProperty} = require('../validators/propertyValidator');

// Function to get all properties
const getAllProperties = async (req,res)=>{
    try {
        const properties = await Property.find();
        res.status(200).json(properties);
    }
    catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Function to create a new property
// This function will be called when the user submits the form to create a new property

const createProperty = async (req, res) => {
    try{
        // Getting all the fields input from the form in UI body
        const { name, address, locality, type, unitCount, createdBy } = req.body;
        
        // Validate the input data using the validator
        const validationError = validateProperty(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // Check if the property already exists
        const existingProperty = await Property.find({ name, address, locality });
        if (existingProperty.length > 0) {
            return res.status(400).json({ message: 'Property already exists' });
        }


        // Create an instance of the model with the input data
        const property = new Property({
            name,
            address,
            locality,
            type,
            unitCount,
            createdBy
        });

        // Save the property to the database
        await property.save();
        
        // Respond with the created property
        res.status(201).json(property);

    }
    catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Function to update a property
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find the property by ID and update it
        const updatedProperty = await Property.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.status(200).json(updatedProperty);
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Function to delete a property
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the property by ID and delete it
        const deletedProperty = await Property.findByIdAndDelete(id);

        if (!deletedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Exporting the functions to be used in routes
module.exports = {
    getAllProperties,
    createProperty,
    updateProperty,
    deleteProperty
};

