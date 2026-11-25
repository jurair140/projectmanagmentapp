const mongoose = require('mongoose');

/**
 * Connect to MongoDB using MONGODB_URI from environment variables.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  const conn = await mongoose.connect(uri);
  if (process.env.NODE_ENV !== 'test') {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  }
  return conn;
};

module.exports = connectDB;
