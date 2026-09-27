const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: MONGO_URI environment variable is not set. Exiting.');
      process.exit(1);
    }
    // Fall back to local MongoDB only in development
    console.warn('MONGO_URI not set – falling back to local MongoDB (development only).');
  }

  try {
    await mongoose.connect(uri || 'mongodb://localhost:27017/accessable', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
