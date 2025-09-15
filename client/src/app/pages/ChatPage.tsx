import React, { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useParams } from 'react-router-dom'

export default function ChatPage() {
  const { sender, receiver } = useParams() as { sender: string; receiver: string }

  const [socket, setSocket] = useState<Socket | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // connect socket
    const s = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    })

    setSocket(s)

    // lắng nghe tin nhắn từ server
    s.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      s.disconnect()
    }
  }, [])

  const handleSendMessage = () => {
    if (message.trim() === '' || !socket) return

    socket.emit('send-message', { receiver, content: message }) // ✅ sửa cho khớp với server
    setMessage('')
  }

  return (
    <>
      <div>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.senderId}</b>: {m.content}
          </p>
        ))}
      </div>

      <input
        placeholder="Enter text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Enter</button>
    </>
  )
}
