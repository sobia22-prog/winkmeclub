import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { SocketService } from './services/socket.service';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  SocketService.init(server);

  server.listen(PORT, () => {
    console.log(`[Server] Wink Me Club API + WebSockets live & listening on port ${PORT}`);
  });
};

startServer();

