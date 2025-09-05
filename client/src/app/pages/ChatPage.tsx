import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';

export default function ChatPage({receiver}: {receiver: string}) {
    const [socket, setSocket] = useState<any>(null)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        if (socket) {
            socket.on("receive-message", (msg) => {
                setIncoming({ fromSelf: false, message: msg })
            });
        }
    })

    useEffect(() => {
        const s = io('', {
            auth: {
                token: localStorage.getItem('token')
            }
        })
        setSocket(s);

        // receive message
        s.on('receive-message', (msg: string) => {
            setMessages(prev => [...prev, msg]);
        })

    }, [])
    const handleSendMessage = () => {
        if (message.trim() === '' || !socket) return;

        // emit message to back end
        socket.emit('send-message', { receiver, message })
        setMessage('');
    }
    return (
        <>
            <div>
                {messages.map((m, i) => <p key={i}>{m}</p>)}
            </div>
            {/* Message */}
            <input placeholder='Enter text' value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleSendMessage}>Enter</button>
        </>
    )
}

