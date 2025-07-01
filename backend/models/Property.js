const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: { 
        type: String, 
        minlength: 3, 
        required: true 
    },
    address: { 
        type: String,
        required: true
    },
    locality: { 
        type: String
    },
    type: { 
        type: String, 
        enum: ['Residential', 'Commercial'], 
        required: true 
    },
    unitCount: { 
        type: Number, 
        min: 1, 
        required: true 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Property', propertySchema);