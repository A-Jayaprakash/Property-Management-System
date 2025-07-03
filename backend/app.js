// Core modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Import custom modules
const propertyRoutes = require('./routes/propertyRoutes');

// Initialize Express app
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// CORS configuration - Fixed for development and production
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-app-name.onrender.com', 'https://your-custom-domain.com'] // Replace with your actual domains
        : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:3000', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static(path.join(__dirname, '../frontend')));


// Only serve index.html for routes that are NOT API calls
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


// Add request logging middleware for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

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
connectDB();

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Property Management System API is running...', status: 'OK' });
});

// Mount property routes
app.use('/api/properties', propertyRoutes);

// Production middleware (serve static files)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
    });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error' 
    });
});

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB URI: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);
});