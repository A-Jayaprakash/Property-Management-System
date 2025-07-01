// Core modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');


// Load environment variables from .env file
dotenv.config();

// Import custom modules
const propertyRoutes = require('../backend/routes/propertyRoutes');

// Initialize Express app
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware for CORS
app.use(cors());

// MongoDB connection
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

connectDB();

// Mount property routes
app.use('/api/properties', propertyRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Property Management System API is running...');
});

// Error handling middleware (optional extension)
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
