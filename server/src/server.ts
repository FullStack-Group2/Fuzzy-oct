// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy, Le Nguyen Khuong Duy
// ID: s3975371, s4026694

import app from './app';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import { initChatRoutes, initChatSockets } from './services/ChatService';

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = process.env.PORT || 5001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

initChatRoutes(app);
initChatSockets(io);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
