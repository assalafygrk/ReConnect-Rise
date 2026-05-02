const mongoose = require('mongoose');

// Cache the connection promise to avoid creating multiple connections
// in a serverless environment where the module may be re-evaluated
let connectionPromise = null;

const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Create and cache the connection promise
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  }).then(conn => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  }).catch(err => {
    console.error(`MongoDB Connection Error: ${err.message}`);
    connectionPromise = null; // Reset so next request retries
    throw err;
  });

  return connectionPromise;
};

module.exports = connectDB;
