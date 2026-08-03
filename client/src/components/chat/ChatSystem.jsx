import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FiSend, FiUser } from 'react-icons/fi';
import dayjs from 'dayjs';

export default function ChatSystem({ partnerId }) {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        const socketInstance = io('/', {
            query: { userId: user.id }
        });

        setSocket(socketInstance);

        socketInstance.on('receiveMessage', (msg) => {
            if (msg.sender_id === partnerId || msg.receiver_id === partnerId) {
                setMessages(prev => [...prev, msg]);
            }
        });

        socketInstance.on('messageSent', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, [user.id, partnerId]);

    // Fetch History
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`/api/chat/${partnerId}`);
                setMessages(res.data);
                
                // Mark as read
                await axios.put(`/api/chat/${partnerId}/read`);
            } catch (err) {
                console.error('Failed to load chat history', err);
            }
        };
        fetchHistory();
    }, [partnerId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('sendMessage', {
            sender_id: user.id,
            receiver_id: partnerId,
            content: newMessage.trim()
        });

        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[500px] bg-background/50 rounded-2xl border border-primary/20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-primary/20 bg-background/80 flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    Real-time Chat
                </h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-text-muted text-xs italic">
                        No messages yet. Send a nudge to start chatting!
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.sender_id === user.id;
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                    isMe ? 'bg-primary text-background rounded-tr-none' 
                                         : 'bg-surface-elevated text-text-primary rounded-tl-none border border-border-subtle'
                                }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-primary' : 'text-text-muted'}`}>
                                        {dayjs(msg.createdAt).format('h:mm A')}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-background/80 border-t border-primary/20 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-surface-elevated border border-border-subtle rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-primary hover:bg-primary text-background rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                    <FiSend />
                </button>
            </form>
        </div>
    );
}
