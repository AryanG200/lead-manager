const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // If already connected, return cached connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lead-manager';
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 10000,
    });
    cachedConnection = conn;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      console.error('[Database] Could not connect to MongoDB. Please ensure MongoDB Atlas Network Access has 0.0.0.0/0 enabled.');
    }
    throw error;
  }
};

module.exports = connectDB;
