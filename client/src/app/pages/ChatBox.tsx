import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/stores/AuthProvider';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

interface ChatBoxProps {
  senderId: string;
  receiverId: string | undefined;
}

export default function ChatBox({ senderId, receiverId }: ChatBoxProps) {
  const { user, isAuth } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // fetch lịch sử chat
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const res = await fetch(
          `http://localhost:5001/api/chat/${receiverId}`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error('Failed to fetch history');

        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    if (isAuth && user) fetchHistory();
  }, [receiverId, isAuth, user]);

  // socket connect
  useEffect(() => {
    if (!isAuth || !user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const s = io('http://localhost:5001', { auth: { token } });
    setSocket(s);

    s.on('receive-message', (newMsg: Message) => {
      if (
        (newMsg.senderId === senderId && newMsg.receiverId === receiverId) ||
        (newMsg.senderId === receiverId && newMsg.receiverId === senderId)
      ) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => {
      s.disconnect();
    };
  }, [senderId, receiverId, isAuth, user]);

  // auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!socket || !message.trim()) return;
    socket.emit('send-message', { receiver: receiverId, content: message });
    setMessage('');
  };

  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="flex flex-col h-full">
      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet</p>
        ) : (
          messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${
                m.senderId === senderId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                  m.senderId === senderId
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border text-gray-800'
                }`}
              >
                <p>{m.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* input */}
      <div className="p-3 border-t bg-white flex space-x-2">
        <input
          className="flex-1 p-2 border rounded-lg focus:outline-none"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button
          onClick={handleSendMessage}
          className="px-4 bg-blue-500 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
