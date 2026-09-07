import mongoose from 'mongoose';
import dns from 'dns';

if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch {
    // ignore
  }
}

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  maxPoolSize: 20,
  minPoolSize: 2,
  bufferCommands: false,
};

export const isDbReady = (): boolean => mongoose.connection.readyState === 1;

export const connectDB = async (): Promise<void> => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/winkmeclub';

  try {
    await mongoose.connect(connStr, MONGO_OPTIONS);
    console.log(`[MongoDB] Connected successfully to host: ${mongoose.connection.host}`);
    return;
  } catch (error: any) {
    console.error(`[MongoDB] Connection error (${error.message}).`);
    console.warn('Ensure your MongoDB Atlas Network Access IP Whitelist includes 0.0.0.0/0 (Allow from anywhere).');
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/winkmeclub', {
        ...MONGO_OPTIONS,
        serverSelectionTimeoutMS: 3000,
      });
      console.log('[MongoDB] Connected to local MongoDB fallback instance.');
      return;
    } catch {
      console.error('[MongoDB] Local fallback also unavailable.');
    }
  }

  throw new Error('Failed to connect to MongoDB. Server cannot start without a database.');
};
