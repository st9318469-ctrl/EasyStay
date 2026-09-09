import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

export default function MessageHostModal({ host, propertyId, onClose }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSend = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            onClose?.();
            navigate("/login");
            return;
        }

        if (!host?._id) {
            alert("Host not found.");
            return;
        }

        if (!message.trim()) return;

        setLoading(true);
        try {
            const conversationRes = await axios.post(
                `${API_BASE_URL}/api/messages/conversations`,
                { participantId: host._id, propertyId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const conversationId = conversationRes.data?.conversation?._id;
            if (!conversationId) throw new Error("Failed to create conversation");

            await axios.post(
                `${API_BASE_URL}/api/messages/send`,
                { conversationId, receiverId: host._id, content: message.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onClose?.();
            navigate("/messages", { state: { conversationId } });
        } catch (error) {
            console.error("Send message error:", error);
            alert(error.response?.data?.message || "Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold" style={{ color: "#1A1A18" }}>
                        Message {host?.name || "Host"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Write your message..."
                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                />

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleSend}
                        disabled={loading || !message.trim()}
                        className="flex-1 py-3 rounded-lg font-bold transition-all"
                        style={{
                            background: loading || !message.trim() ? "#B4B2A9" : "#1A1A18",
                            color: "#FAFAF8",
                            cursor: loading || !message.trim() ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg font-medium border hover:bg-gray-50"
                        style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
