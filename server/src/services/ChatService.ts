

import { ChatModel } from '../models/Chat';
import { UserModel } from '../models/User';
import { authMiddleware } from '../middleware/authMiddleware';
import { verifyToken } from '../utils/verifyToken';
import { Server, Socket } from 'socket.io';
import { Application } from 'express';

// In-memory store for online users
const onlineUsers = new Map<string, string>();

export function initChatRoutes(app: Application) {
  // ✅ Get vendor's conversations
  app.get(
    '/api/chat/conversations/:customerId',
    authMiddleware,
    async (req, res) => {
      try {
        const vendorId = (req as any).user.userId;
        const customerId = req.params.customerId;

        const chats = await ChatModel.find({
          $or: [{ senderId: vendorId }, { receiverId: vendorId }],
        });

        const customerIds = [
          ...new Set(
            chats.map((chat) =>
              chat.senderId.toString() === vendorId
                ? chat.receiverId.toString()
                : chat.senderId.toString(),
            ),
          ),
        ];

        const customers = await UserModel.find({
          _id: { $in: customerIds },
        }).select('-password');

        res.json(customers);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
      }
    },
  );

  // ✅ Get chat messages between sender and receiver
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
}

export function initChatSockets(io: Server) {
  // Middleware for socket auth
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error: No token provided'));

      const user = await verifyToken(token);
      (socket as any).user = user;
      next();
    } catch (err: any) {
      console.error('Socket auth error:', err.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    onlineUsers.set(user.userId, socket.id);
    console.log(`User connected: ${user.username} (${user.userId})`);

    socket.on('send-message', async ({ receiver, content }) => {
      try {
        const newMsg = await ChatModel.create({
          senderId: user.userId,
          receiverId: receiver,
          message: content,
          createdAt: new Date(),
        });

        const receiverSocketId = onlineUsers.get(receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive-message', newMsg);
        }

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
}
