import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // Fixed import path to point to api/axios instance

const OTPModal = ({ email, onClose, onSuccess }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendMessage, setResendMessage] = useState('');
    const [timer, setTimer] = useState(60);

    // Countdown timer for Resend OTP button
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Format OTP input to allow numbers only
    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Filter out non-numeric characters
        if (value.length <= 6) {
            setOtp(value);
            if (error) setError('');
        }
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/verify-email', {
                email,
                otp
            });

            if (response.data?.success) {
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                onSuccess(response.data);
                onClose();
            } else {
                setError(response.data?.message || 'Verification failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (timer > 0) return;

        setResendLoading(true);
        setError('');
        setResendMessage('');

        try {
            const response = await api.post('/auth/resend-otp', { email });
            if (response.data?.success) {
                setResendMessage('A new OTP has been sent to your email.');
                setTimer(60); // Reset 60-second cooldown timer
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-100 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Verify Email</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-semibold p-1"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-gray-600 text-sm mb-6">
                    Enter the 6-digit code sent to <span className="font-semibold text-gray-800">{email}</span>
                </p>

                {/* Form */}
                <form onSubmit={handleVerify}>
                    <div className="mb-4">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={otp}
                            onChange={handleOtpChange}
                            placeholder="• • • • • •"
                            className="w-full border border-gray-300 rounded-lg p-3 text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                            maxLength="6"
                            autoFocus
                        />
                    </div>

                    {/* Error & Info Messages */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-md mb-4 text-center font-medium">
                            {error}
                        </div>
                    )}

                    {resendMessage && (
                        <div className="bg-green-50 text-green-700 text-xs p-2.5 rounded-md mb-4 text-center font-medium">
                            {resendMessage}
                        </div>
                    )}

                    {/* Actions */}
                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-3"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>

                {/* Resend & Cancel */}
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={timer > 0 || resendLoading}
                        className="text-indigo-600 hover:text-indigo-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {resendLoading
                            ? 'Sending...'
                            : timer > 0
                            ? `Resend OTP in ${timer}s`
                            : 'Resend OTP'}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;