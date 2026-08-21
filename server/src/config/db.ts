import mongoose from 'mongoose';
import dns from 'dns';

// Fix Node.js SRV DNS resolution only on Windows local environments
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    // ignore
  }
}

export const connectDB = async (): Promise<void> => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/winkmeclub';
  try {
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${mongoose.connection.host}`);
  } catch (error: any) {
    console.error(`[MongoDB] Connection error (${error.message}).`);
    console.warn('Ensure your MongoDB Atlas Network Access IP Whitelist includes 0.0.0.0/0 (Allow from anywhere).');
    
    // Attempt fallback to local MongoDB instance if running locally
    if (process.env.NODE_ENV !== 'production') {
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/winkmeclub', {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB] Connected to local MongoDB fallback instance.`);
      } catch (fallbackErr) {
        console.error('[MongoDB] Local fallback also unavailable.');
      }
    }
  }
};
