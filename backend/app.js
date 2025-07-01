// Core modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // ADD THIS LINE

// Load environment variables from .env file
dotenv.config();

// Import custom modules
const propertyRoutes = require('./routes/propertyRoutes'); // FIXED PATH

// Initialize Express app
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// CORS configuration (SINGLE CORS SETUP)
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:5500'] // Added local dev origins
}));

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

// Connect to database


// Mount property routes
app.use('/api/properties', propertyRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Property Management System API is running...');
});

// Production middleware (MOVED TO END)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend'));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    });
}

// Error handling middleware
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