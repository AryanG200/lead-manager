const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lead-manager';
    const conn = await mongoose.connect(connUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // If running in development and Atlas fails, alert user
    if (process.env.NODE_ENV !== 'test') {
      console.error('[Database] Could not connect to MongoDB. Please verify MONGODB_URI in server/.env');
    }
    throw error;
  }
};

module.exports = connectDB;
