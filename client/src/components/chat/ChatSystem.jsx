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
        const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
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
        <div className="flex flex-col h-[500px] bg-slate-900/50 rounded-2xl border border-indigo-500/20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-indigo-500/20 bg-slate-900/80 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    Real-time Chat
                </h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                        No messages yet. Send a nudge to start chatting!
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.sender_id === user.id;
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                    isMe ? 'bg-indigo-600 text-white rounded-tr-none' 
                                         : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
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
            <form onSubmit={handleSend} className="p-3 bg-slate-900/80 border-t border-indigo-500/20 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                    <FiSend />
                </button>
            </form>
        </div>
    );
}
