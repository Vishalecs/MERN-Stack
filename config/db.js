const mongoose = require('mongoose');

// Ensure that you have a valid MongoDB URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/trangggsactionDB';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process with failure
  }
};

module.exports = connectDB;
