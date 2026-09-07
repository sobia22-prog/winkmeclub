import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { SocketService } from './services/socket.service';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const server = http.createServer(app);
  SocketService.init(server);

  server.listen(PORT, () => {
    console.log(`[Server] Wink Me Club API + WebSockets live & listening on port ${PORT}`);
  });

  try {
    await connectDB();
  } catch (error: any) {
    console.error(`[Server] Initial DB connection failed: ${error.message}. Retrying in background...`);
    setTimeout(() => {
      connectDB().catch((err) => console.error(`[Server] DB reconnect attempt failed: ${err.message}`));
    }, 5000);
  }
};

startServer();
