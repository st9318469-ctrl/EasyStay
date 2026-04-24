import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Messages() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const initialConversationId = location.state?.conversationId;

    useEffect(() => {
        // Connect to socket
        const newSocket = io(API_URL);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket && user.id) {
            socket.emit('join', user.id);

            socket.on('new_message', (message) => {
                if (selectedConversation?._id === message.conversation) {
                    setMessages(prev => [...prev, message]);
                    markAsRead(selectedConversation._id);
                } else {
                    fetchConversations();
                }
                scrollToBottom();
            });

            socket.on('user_typing', (data) => {
                if (selectedConversation?.participants?.some(p => p._id === data.userId)) {
                    setIsTyping(data.isTyping);
                }
            });

            return () => {
                socket.off('new_message');
                socket.off('user_typing');
            };
        }
    }, [socket, selectedConversation]);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (!initialConversationId || !conversations.length) return;
        const found = conversations.find((c) => c._id === initialConversationId);
        if (found) setSelectedConversation(found);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversations, initialConversationId]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation._id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/messages/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data.messages);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/messages/${conversationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            conversationId: selectedConversation._id,
            senderId: user.id,
            receiverId: selectedConversation.otherParticipant?._id,
            content: newMessage
        };

        if (socket) {
            socket.emit('send_message', messageData);
        }

        setNewMessage('');
        setTyping(false);
        
        // Optimistically add message
        setMessages(prev => [...prev, {
            _id: Date.now(),
            content: newMessage,
            sender: { _id: user.id, name: user.name },
            createdAt: new Date()
        }]);
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (!typing && e.target.value.length > 0) {
            setTyping(true);
            socket?.emit('typing', {
                receiverId: selectedConversation.otherParticipant?._id,
                senderId: user.id,
                isTyping: true
            });
        } else if (typing && e.target.value.length === 0) {
            setTyping(false);
            socket?.emit('typing', {
                receiverId: selectedConversation.otherParticipant?._id,
                senderId: user.id,
                isTyping: false
            });
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p style={{ color: "#5F5E5A" }}>Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "#FAFAF8", padding: "80px 0" }}>
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}>
                    Messages
                </h1>
                <p style={{ color: "#5F5E5A" }} className="mb-6">Chat with hosts and guests</p>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden flex h-[600px]">
                    {/* Conversations List */}
                    <div className="w-80 border-r overflow-y-auto" style={{ borderColor: "rgba(26,26,24,0.08)" }}>
                        <div className="p-4 border-b sticky top-0 bg-white" style={{ borderColor: "rgba(26,26,24,0.08)" }}>
                            <h3 className="font-semibold" style={{ color: "#1A1A18" }}>Conversations</h3>
                        </div>
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-400 text-sm">No messages yet</p>
                                <button
                                    onClick={() => navigate('/my-trips')}
                                    className="mt-3 text-sm px-4 py-2 rounded-lg"
                                    style={{ background: "#1A1A18", color: "#FAFAF8" }}
                                >
                                    Book a property to start chatting
                                </button>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv._id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                                        selectedConversation?._id === conv._id ? 'bg-gray-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm">
                                            {conv.otherParticipant?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between">
                                                <p className="font-medium truncate" style={{ color: "#1A1A18" }}>
                                                    {conv.otherParticipant?.name}
                                                </p>
                                                <span className="text-xs text-gray-400">
                                                    {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'No messages'}</p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    {conv.property && (
                                        <p className="text-xs text-gray-400 mt-1 truncate">
                                            📍 {conv.property.title}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Area */}
                    {selectedConversation ? (
                        <div className="flex-1 flex flex-col">
                            {/* Chat Header */}
                            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(26,26,24,0.08)" }}>
                                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm">
                                    {selectedConversation.otherParticipant?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="font-medium" style={{ color: "#1A1A18" }}>
                                        {selectedConversation.otherParticipant?.name}
                                    </p>
                                    {selectedConversation.property && (
                                        <p className="text-xs text-gray-400">
                                            {selectedConversation.property.title}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={msg._id}
                                        className={`flex ${msg.sender?._id === user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                msg.sender?._id === user.id
                                                    ? 'bg-black text-white'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${
                                                msg.sender?._id === user.id ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: "rgba(26,26,24,0.08)" }}>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={handleTyping}
                                        placeholder="Type a message..."
                                        className="flex-1 p-3 border rounded-lg outline-none focus:border-black"
                                        style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-6 py-3 rounded-lg font-medium transition-all"
                                        style={{
                                            background: newMessage.trim() ? "#1A1A18" : "#B4B2A9",
                                            color: "#FAFAF8",
                                            cursor: newMessage.trim() ? "pointer" : "not-allowed"
                                        }}
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <p className="text-gray-400">Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
