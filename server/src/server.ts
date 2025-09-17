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
import { UserModel } from './models/User';

// Configure dotenv to find the .env file in the root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// const onlineUsers = new Map<string, string>() // userId → socketId

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const user = await verifyToken(token);
    (socket as any).user = user;
    next();
  } catch (err: any) {
    console.error('Socket auth error:', err.message);
    next(new Error('Authentication failed'));
  }
});


app.get(
  '/api/chat/conversations/:customerId',
  authMiddleware,
  async (req, res) => {
    try {
      // 1. Get the logged-in user's ID (the vendor)
      const vendorId = (req as any).user.userId;
      const customerId = req.params.customerId;
      // 2. Find all chats where the vendor is either the sender or receiver
      const chats = await ChatModel.find({
        $or: [{ senderId: vendorId }, { receiverId: vendorId }],
      });

      // 3. Get a unique list of the OTHER user's ID from those chats
      const customerIds = [
        ...new Set(
          chats.map((chat) =>
            // If the sender was the vendor, get the receiver ID, otherwise get the sender ID
            chat.senderId.toString() === vendorId
              ? chat.receiverId.toString()
              : chat.senderId.toString(),
          ),
        ),
      ];

      // 4. Find the user details for those unique customer IDs
      const customers = await UserModel.find({
        _id: { $in: customerIds },
      }).select('-password');

      // 5. Return the list of customers
      res.json(customers);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Error fetching conversations' });
    }
  },
);

app.get('/api/chat/:receiverId', authMiddleware, async (req, res) => {
  try {
    const senderId = (req as any).user.userId;
    const { receiverId } = req.params;

    const messages = await ChatModel.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 'asc' });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

const onlineUsers = new Map<string, string>(); // userId → socketId

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    const user = await verifyToken(token);
    (socket as any).user = user;
    next();
  } catch (err: any) {
    console.error('Socket auth error:', err.message);
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  const user = (socket as any).user;
  onlineUsers.set(user.userId, socket.id);
  console.log(`User connected: ${user.username} (${user.userId})`);

  socket.on('send-message', async ({ receiver, content }) => {
    try {
      // ✅ FIXED: Use 'message' to match the schema, not 'content'
      const newMsg = await ChatModel.create({
        senderId: user.userId,
        receiverId: receiver,
        message: content, // The fix is here!
        createdAt: new Date(),
      });

      // Send to the receiver if they are online
      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-message', newMsg);
      }
      // ➕ ADDED: Also send the message back to the sender to confirm it was saved
      socket.emit('receive-message', newMsg);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(user.userId);
    console.log(`User disconnected: ${user.username}`);
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
