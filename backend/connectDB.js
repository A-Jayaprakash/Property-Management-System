const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost/PropertyDB');
        console.log('Connected to MongoDB Successfully...');
    }
    catch (error) {
        console.error('Error while connecting to MongoDB:',error.message);
        process.exit(1);
    }
}

module.exports = connectDB;