import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StartConversationModal({ hostId, hostName, propertyId, propertyTitle, onClose }) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleStart = async () => {
        if (!message.trim()) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/messages/conversations`, {
                participantId: hostId,
                propertyId,
                bookingId: null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Send first message
            await axios.post(`${API_URL}/api/messages/send`, {
                conversationId: response.data.conversation._id,
                receiverId: hostId,
                content: message
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            navigate('/messages');
        } catch (error) {
            console.error('Error starting conversation:', error);
            alert('Failed to start conversation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: "#1A1A18" }}>Message {hostName}</h3>
                    <p className="text-sm text-gray-500 mt-1">About: {propertyTitle}</p>
                </div>
                
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows="4"
                    className="w-full p-3 border rounded-lg outline-none focus:border-black mb-4"
                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                />
                
                <div className="flex gap-3">
                    <button
                        onClick={handleStart}
                        disabled={loading || !message.trim()}
                        className="flex-1 py-2 rounded-lg font-medium"
                        style={{
                            background: message.trim() ? "#1A1A18" : "#B4B2A9",
                            color: "#FAFAF8"
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg font-medium border"
                        style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}