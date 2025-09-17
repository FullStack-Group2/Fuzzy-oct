// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Nguyen Khuong Duy
// ID: s402664

import { useAuth } from '@/stores/AuthProvider';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, Outlet } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

export default function ChatPanel() {
  const { receiverId } = useParams<{ receiverId: string }>();
  const navigate = useNavigate();
  const { user, isAuth } = useAuth();

  const [listOfCustomers, setListOfCustomers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  // Socket connect
  useEffect(() => {
    if (!isAuth || !user) return;

    const token = localStorage.getItem('token');
    const newSocket = io(
      import.meta.env.VITE_API_URL || 'http://localhost:5001',
      {
        auth: { token },
      },
    );

    newSocket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [isAuth, user]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/chat/conversations/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setListOfCustomers(data);
      } catch (err) {
        console.error('❌ Fetch conversations error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchConversations();
  }, [user]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!receiverId || !user) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/chat/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('❌ Fetch messages error:', err);
      }
    };
    fetchMessages();
  }, [receiverId, user]);

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !receiverId) return;
    socket?.emit('send-message', {
      receiver: receiverId,
      content: newMessage,
    });
    setNewMessage('');
  };

  if (loading) return <p className="p-4">Loading chats...</p>;

  return (
    <div className="flex h-[80vh] border rounded shadow">
      {/* Sidebar */}
      <aside className="w-1/3 border-r p-4 overflow-y-auto">
        <h3 className="font-semibold mb-3">Conversations</h3>
        <ul>
          {listOfCustomers.map((c) => (
            <li key={c._id}>
              <Link
                to={`/chat/${user.id}/${c._id}`}
                className={`block p-2 rounded hover:bg-gray-100 ${
                  receiverId === c._id ? 'bg-gray-200' : ''
                }`}
              >
                {c.name || c.email}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat area */}
      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        <Outlet /> {/* 👈 nơi ChatPage được render */}
      </main>
    </div>
  );
}
