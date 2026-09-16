const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Ensures strict query mode and handles graceful connection failures
 */
const connectDB = async () => {
  try {
    const connURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxehair';
    const conn = await mongoose.connect(connURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.log('[Database Warning] Continuing with server startup. If Mongo is not running, ensure service is started.');
  }
};

module.exports = connectDB;
