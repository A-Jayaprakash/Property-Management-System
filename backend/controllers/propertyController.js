const Property = require("../models/Property");
const { validateProperty } = require("../validators/propertyValidator");

// Function to get all properties
const getAllProperties = async (req, res) => {
  try {
    let properties;

    // Admin can see all properties
    if (req.user.role === "admin") {
      properties = await Property.find().sort({ createdAt: -1 });
    }
    // Manager can see only their own properties
    else if (req.user.role === "manager") {
      properties = await Property.find({ createdBy: req.user.id }).sort({
        createdAt: -1,
      });
    }
    // Tenant can see all properties (read-only)
    else if (req.user.role === "tenant") {
      properties = await Property.find().sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: "Access denied: Invalid role" });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Function to create a new property
const createProperty = async (req, res) => {
  try {
    // Only admin and manager can create properties
    if (!["admin", "manager"].includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message:
            "Access denied: Only admin and manager can create properties",
        });
    }

    console.log("Received property data:", req.body);

    // Getting all the fields input from the form in UI body
    const { name, address, locality, type, unitCount } = req.body;

    // Validate the input data using the validator
    const validationError = validateProperty(req.body);
    if (validationError) {
      console.log("Validation error:", validationError);
      return res.status(400).json({ message: validationError });
    }

    // Check if the property already exists (same name and address)
    const existingProperty = await Property.findOne({
      name: name.trim(),
      address: address.trim(),
    });

    if (existingProperty) {
      return res
        .status(400)
        .json({
          message: "Property with this name and address already exists",
        });
    }

    // Create an instance of the model with the input data
    const property = new Property({
      name: name.trim(),
      address: address.trim(),
      locality: locality?.trim() || "",
      type,
      unitCount: parseInt(unitCount),
      createdBy: req.user.id, // Set the creator as the authenticated user
    });

    // Save the property to the database
    const savedProperty = await property.save();
    console.log("Property saved successfully:", savedProperty);

    // Respond with the created property
    res.status(201).json(savedProperty);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      details: error.name === "ValidationError" ? error.errors : undefined,
    });
  }
};

// Function to update a property
const updateProperty = async (req, res) => {
  try {
    // Only admin and manager can update properties
    if (!["admin", "manager"].includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message:
            "Access denied: Only admin and manager can update properties",
        });
    }

    const { id } = req.params;
    const updates = req.body;

    console.log("Updating property:", id, updates);

    // Find the property first to check ownership
    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Manager can only update their own properties, admin can update any property
    if (
      req.user.role === "manager" &&
      existingProperty.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({
          message: "Access denied: You can only update properties you created",
        });
    }

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

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    console.log("Property updated successfully:", updatedProperty);
    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to delete a property
const deleteProperty = async (req, res) => {
  try {
    // Only admin and manager can delete properties
    if (!["admin", "manager"].includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message:
            "Access denied: Only admin and manager can delete properties",
        });
    }

    const { id } = req.params;

    console.log("Deleting property:", id);

    // Find the property first to check ownership
    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Manager can only delete their own properties, admin can delete any property
    if (
      req.user.role === "manager" &&
      existingProperty.createdBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({
          message: "Access denied: You can only delete properties you created",
        });
    }

    // Delete the property
    const deletedProperty = await Property.findByIdAndDelete(id);

    console.log("Property deleted successfully:", deletedProperty.name);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Exporting the functions to be used in routes
module.exports = {
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
};
