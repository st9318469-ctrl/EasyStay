import { useState } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

export default function UPIPayment({ amount, bookingId, onSuccess, onClose }) {
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Generate UPI Payment Link
    const generateUPILink = () => {
        const upiId = 'easystay@okhdfcbank'; // Your UPI ID
        const payeeName = 'EasyStay';
        const transactionNote = `Booking-${bookingId.slice(-6)}`;
        const amountValue = amount;
        
        // Create UPI payment URL
        const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amountValue}&tn=${transactionNote}&cu=INR`;
        return upiUrl;
    };

    // Verify UPI payment via backend
    const verifyPayment = async () => {
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/api/payments/verify-upi`,
                { bookingId, transactionId, amount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Verification failed');
            }

            setPaymentStatus('success');
            
            setTimeout(() => {
                onSuccess?.();
                onClose?.();
                navigate('/my-trips');
            }, 2000);
            
        } catch (error) {
            console.error('Payment verification failed:', error);
            setPaymentStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    const handleManualVerification = () => {
        if (transactionId.length >= 6) {
            verifyPayment();
        }
    };

    const copyUPILink = () => {
        const upiLink = generateUPILink();
        navigator.clipboard.writeText(upiLink);
        alert('UPI link copied! Open any UPI app to pay.');
    };

    if (paymentStatus === 'success') {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A18" }}>Payment Successful! 🎉</h3>
                <p className="text-gray-500">Your booking is confirmed. Redirecting...</p>
            </div>
        );
    }

    if (paymentStatus === 'failed') {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A18" }}>Payment Failed</h3>
                <p className="text-gray-500 mb-4">Please try again or use another payment method</p>
                <button
                    onClick={() => setPaymentStatus('pending')}
                    className="px-6 py-2 rounded-lg"
                    style={{ background: "#1A1A18", color: "#FAFAF8" }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-bold" style={{ color: "#1A1A18" }}>Pay with UPI</h3>
                <p className="text-sm text-gray-500 mt-1">Amount: ₹{amount?.toLocaleString()}</p>
            </div>

            {/* UPI Options */}
            <div className="space-y-4">
                {/* Option 1: QR Code */}
                <div className="border rounded-xl p-4 text-center">
                    <p className="text-sm font-medium mb-3">Scan QR Code</p>
                    <div className="flex justify-center mb-3">
                        <div className="p-3 bg-white rounded-xl shadow-md">
                            <QRCode
                                value={generateUPILink()}
                                size={180}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)
                    </p>
                </div>

                {/* Option 2: UPI Apps */}
                <div className="border rounded-xl p-4">
                    <p className="text-sm font-medium mb-3 text-center">Pay with UPI App</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                            { name: 'Google Pay', icon: '📱', color: '#4285F4' },
                            { name: 'PhonePe', icon: '📱', color: '#5F259F' },
                            { name: 'Paytm', icon: '📱', color: '#00BAF2' },
                            { name: 'Amazon Pay', icon: '📱', color: '#FF9900' },
                            { name: 'BHIM', icon: '📱', color: '#0052CC' },
                            { name: 'Other', icon: '📱', color: '#666' }
                        ].map(app => (
                            <button
                                key={app.name}
                                onClick={() => window.open(generateUPILink(), '_blank')}
                                className="py-2 rounded-lg text-center transition-all hover:scale-105"
                                style={{ background: app.color, color: 'white' }}
                            >
                                <div className="text-xl">{app.icon}</div>
                                <div className="text-xs mt-1">{app.name}</div>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={copyUPILink}
                        className="w-full py-2 text-sm rounded-lg border mt-2"
                        style={{ borderColor: "#1A1A18", color: "#1A1A18" }}
                    >
                        Copy UPI Link
                    </button>
                </div>

                {/* Option 3: Manual Transaction ID */}
                <div className="border rounded-xl p-4">
                    <p className="text-sm font-medium mb-3">Already Paid?</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter Transaction ID"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="flex-1 p-2 border rounded-lg text-sm"
                            style={{ borderColor: "rgba(26,26,24,0.2)" }}
                        />
                        <button
                            onClick={handleManualVerification}
                            disabled={loading || transactionId.length < 6}
                            className="px-4 py-2 rounded-lg text-sm font-medium"
                            style={{
                                background: transactionId.length >= 6 ? "#1A1A18" : "#B4B2A9",
                                color: "#FAFAF8",
                                cursor: transactionId.length >= 6 ? "pointer" : "not-allowed"
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Enter the transaction ID from your UPI app
                    </p>
                </div>
            </div>

            {/* UPI Apps Information */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                    💡 <strong>How to pay:</strong><br/>
                    1. Open any UPI app (Google Pay, PhonePe, Paytm)<br/>
                    2. Scan QR code or click the app button<br/>
                    3. Enter UPI PIN to complete payment<br/>
                    4. Enter transaction ID above to confirm
                </p>
            </div>

            <div className="flex gap-3 mt-4">
                <button
                    onClick={() => window.open(generateUPILink(), '_blank')}
                    className="flex-1 py-2 rounded-lg font-medium"
                    style={{ background: "#1A1A18", color: "#FAFAF8" }}
                >
                    Pay Now
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
    );
}
