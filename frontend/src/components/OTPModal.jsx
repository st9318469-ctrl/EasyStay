import React, { useState } from 'react';
import axios from 'axios';

const OTPModal = ({ email, onClose, onSuccess }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify', {
                email,
                otp
            });
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-bold mb-4">Verify Email</h2>
                <p className="text-gray-600 mb-4">Enter OTP sent to {email}</p>
                
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full border rounded-lg p-2 mb-4"
                    maxLength="6"
                />
                
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                
                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded-lg"
                >
                    {loading ? 'Verifying...' : 'Verify'}
                </button>
                
                <button
                    onClick={onClose}
                    className="w-full mt-2 text-gray-600 py-2"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default OTPModal;