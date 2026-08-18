import mongoose from 'mongoose';
import dns from 'dns';

// Fix Node.js Windows SRV DNS resolution issues with Google Public DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // ignore if restricted
}

export const connectDB = async (): Promise<void> => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/winkmeclub';
  try {
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${mongoose.connection.host}`);
  } catch (error: any) {
    console.warn(`[MongoDB] Primary connection string notice (${error.message}). Attempting fallback to local MongoDB instance...`);
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/winkmeclub', {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected to local MongoDB fallback instance.`);
    } catch (fallbackErr) {
      console.error('[MongoDB] Connection error: Unable to connect to MongoDB. Ensure your Atlas network IP whitelist allows access or local MongoDB is running.');
      process.exit(1);
    }
  }
};
