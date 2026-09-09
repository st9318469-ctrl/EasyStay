import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const OTPVerificationModal = ({ 
    isOpen, 
    onClose, 
    email, 
    verificationType = 'email',
    onVerificationSuccess 
}) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(0, 1);
        setOtp(newOtp);
        
        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (!email) {
            setError('Missing email. Please register/login again.');
            return;
        }
        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (verificationType !== 'email') {
                setError('Phone verification is not configured on the server.');
                return;
            }

            const endpoint = `${API_BASE_URL}/api/auth/verify-email`;
            
            const response = await axios.post(endpoint, {
                email,
                otp: otpCode
            });

            if (response.data.success) {
                onVerificationSuccess?.(response.data);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;
        if (!email) {
            setError('Missing email. Please register/login again.');
            return;
        }
        
        setResendLoading(true);
        setError('');

        try {
            if (verificationType !== 'email') {
                setError('Phone verification is not configured on the server.');
                return;
            }

            const endpoint = `${API_BASE_URL}/api/auth/resend-otp`;
            
            const response = await axios.post(endpoint, { email });
            
            if (response.data.success) {
                setCountdown(60); // 60 seconds cooldown
                setError('');
                // Clear OTP inputs
                setOtp(['', '', '', '', '', '']);
                // Focus first input
                document.getElementById('otp-0')?.focus();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(26,26,24,0.8)" }}>
            <div 
                className="relative w-full max-w-md mx-4 rounded-2xl"
                style={{ background: "#FAFAF8", animation: "fadeUp 0.3s ease" }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-2xl cursor-pointer"
                    style={{ color: "#B4B2A9" }}
                >
                    ×
                </button>
                
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ background: "#F1EFE8" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#1A1A18">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A18", fontFamily: "Georgia,serif" }}>
                            Verify Your {verificationType === 'email' ? 'Email' : 'Phone'}
                        </h3>
                        <p className="text-sm" style={{ color: "#6B6B68" }}>
                            We've sent a 6-digit verification code to
                            <br />
                            <strong className="font-semibold" style={{ color: "#1A1A18" }}>
                                {verificationType === 'email' ? email : email}
                            </strong>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: "#FEE2E2", color: "#E24B4A" }}>
                            {error}
                        </div>
                    )}

                    <div className="flex justify-center gap-2 mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-xl font-bold rounded-xl outline-none transition-all duration-200"
                                style={{
                                    border: "1.5px solid rgba(26,26,24,0.2)",
                                    background: "#FAFAF8",
                                    color: "#1A1A18"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1A1A18"}
                                onBlur={(e) => e.target.style.borderColor = "rgba(26,26,24,0.2)"}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-medium transition-all duration-200 mb-3"
                        style={{
                            background: loading ? "#B4B2A9" : "#1A1A18",
                            color: "#FAFAF8",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#2A2A28")}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#1A1A18")}
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>

                    <div className="text-center">
                        <p className="text-xs" style={{ color: "#B4B2A9" }}>
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResendOTP}
                                disabled={countdown > 0 || resendLoading}
                                className="font-medium transition-colors hover:underline disabled:opacity-50"
                                style={{ color: "#1A1A18" }}
                            >
                                {resendLoading 
                                    ? 'Sending...' 
                                    : countdown > 0 
                                        ? `Resend in ${countdown}s` 
                                        : 'Resend OTP'
                                }
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPVerificationModal;
