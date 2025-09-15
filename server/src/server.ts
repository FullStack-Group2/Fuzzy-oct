// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author:
// ID:

import app from './app';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import { authMiddleware } from './middleware/authMiddleware';
import { verifyToken } from './utils/verifyToken';
import { ChatModel } from './models/Chat';

// Configure dotenv to find the .env file in the root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = process.env.PORT || 5001;

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const onlineUsers = new Map<string, string>() // userId → socketId

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers?.authorization?.split(' ')[1]

    if (!token) {
      return next(new Error('Authentication error: No token provided'))
    }

    const user = await verifyToken(token)
    ;(socket as any).user = user
    next()
  } catch (err: any) {
    console.error('Socket auth error:', err.message)
    next(new Error('Authentication failed'))
  }
})

io.on('connection', (socket) => {
  const user = (socket as any).user
  onlineUsers.set(user.userId, socket.id)

  console.log(`User connected: ${user.username}`)

  socket.on('send-message', async ({ receiver, content }) => {
    // save to DB
    const newMsg = await ChatModel.create({
      senderId: user.userId,
      receiverId: receiver,
      content,
      createdAt: new Date(),
    })

    // gửi tới người nhận
    const receiverSocketId = onlineUsers.get(receiver)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive-message', newMsg)
    }
  })

  socket.on('disconnect', () => {
    onlineUsers.delete(user.userId)
    console.log(`User disconnected: ${user.username}`)
  })
})

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
