const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('ERROR: MONGO_URI environment variable is not set.');
      // Don't exit — let the server start so Render can bind the port.
      // API routes will return 503 until DB is available.
      return;
    }
    console.warn('MONGO_URI not set – falling back to local MongoDB (development only).');
  }

  try {
    await mongoose.connect(uri || 'mongodb://localhost:27017/accessable');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Do NOT call process.exit(1) — that kills the server before Render
    // can detect an open port, causing an infinite crash loop.
    // The server will keep retrying via mongoose's built-in reconnect logic.
  }
};

module.exports = connectDB;
