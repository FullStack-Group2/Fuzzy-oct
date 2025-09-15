// import React, { useEffect, useState } from 'react'
// import { io, Socket } from 'socket.io-client'
// import { useParams } from 'react-router-dom'

// export default function ChatPage() {
//   const { sender, receiver } = useParams() as { sender: string; receiver: string }

//   const [socket, setSocket] = useState<Socket | null>(null)
//   const [message, setMessage] = useState('')
//   const [messages, setMessages] = useState<any[]>([])

//   useEffect(() => {
//     // connect socket
//     const s = io('http://localhost:3000', {
//       auth: {
//         token: localStorage.getItem('token'),
//       },
//     })

//     setSocket(s)

//     // lắng nghe tin nhắn từ server
//     s.on('receive-message', (msg) => {
//       setMessages((prev) => [...prev, msg])
//     })

//     return () => {
//       s.disconnect()
//     }
//   }, [])

//   const handleSendMessage = () => {
//     if (message.trim() === '' || !socket) return

//     socket.emit('send-message', { receiver, content: message }) // ✅ sửa cho khớp với server
//     setMessage('')
//   }

//   return (
//     <>
//       <div>
//         {messages.map((m, i) => (
//           <p key={i}>
//             <b>{m.senderId}</b>: {m.content}
//           </p>
//         ))}
//       </div>

//       <input
//         placeholder="Enter text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//       />
//       <button onClick={handleSendMessage}>Enter</button>
//     </>
//   )
// }

import { useAuth } from '@/stores/AuthProvider';
import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export default function ChatPage() {
  const { senderId, receiverId } = useParams<{
    senderId: string;
    receiverId: string;
  }>();
  const { user, isAuth } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effect for fetching message history
  useEffect(() => {
    if (!receiverId || !isAuth || !user) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5001/api/chat/${receiverId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMessages(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch chat history', error);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [receiverId, isAuth, user]);

  // Effect for managing the socket connection
  useEffect(() => {
    if (!isAuth || !user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const s = io('http://localhost:5001', {
      auth: {
        token,
      },
    });
    setSocket(s);

    s.on('receive-message', (newMsg: Message) => {
      // Only add the message if it belongs to the current conversation
      if (
        (newMsg.senderId === user.id && newMsg.receiverId === receiverId) ||
        (newMsg.senderId === receiverId && newMsg.receiverId === user.id)
      ) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    s.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Connection failed');
    });

    return () => {
      s.disconnect();
    };
  }, [receiverId, user, isAuth]);

  // Effect to scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() === '' || !socket || !user) return;

    socket.emit('send-message', { receiver: receiverId, content: message });
    setMessage('');
  };

  if (!isAuth || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please log in to access the chat.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading chat history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${
                  m.senderId === user.id
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border rounded-bl-sm'
                }`}
              >
                <p className="break-words">{m.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    m.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
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

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!socket}
          />
          <button
            onClick={handleSendMessage}
            disabled={!socket || message.trim() === ''}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
