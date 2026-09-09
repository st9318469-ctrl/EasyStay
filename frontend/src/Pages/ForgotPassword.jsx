import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Handle send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
            setSuccess(response.data.message);
            setStep(2);
            startCountdown();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Handle verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/verify-reset-otp`, { email, otp });
            setResetToken(response.data.resetToken);
            setSuccess('OTP verified! Set your new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Handle reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                token: resetToken,
                newPassword
            });
            
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Handle resend OTP
    const handleResendOTP = async () => {
        if (countdown > 0) return;
        
        setLoading(true);
        setError('');
        
        try {
            await axios.post(`${API_BASE_URL}/api/auth/resend-reset-otp`, { email });
            setSuccess('New OTP sent to your email');
            startCountdown();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const startCountdown = () => {
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) clearInterval(timer);
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8", padding: "80px 20px" }}>
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1A1A18" }}>
                        Reset Password
                    </h1>
                    <p style={{ color: "#5F5E5A" }}>
                        {step === 1 && "Enter your email to receive OTP"}
                        {step === 2 && "Enter the 6-digit code sent to your email"}
                        {step === 3 && "Create your new password"}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm text-center">
                            {success}
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    placeholder="your@email.com"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg font-bold transition-all"
                                style={{
                                    background: loading ? "#B4B2A9" : "#1A1A18",
                                    color: "#FAFAF8"
                                }}
                            >
                                {loading ? 'Sending...' : 'Send Reset OTP'}
                            </button>
                            
                            <div className="text-center mt-4">
                                <Link to="/login" className="text-sm hover:underline" style={{ color: "#5F5E5A" }}>
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength="6"
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black text-center text-2xl tracking-wider"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    placeholder="000000"
                                />
                                <p className="text-xs mt-2" style={{ color: "#B4B2A9" }}>
                                    Check your email for the 6-digit code
                                </p>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg font-bold transition-all mb-3"
                                style={{
                                    background: loading ? "#B4B2A9" : "#1A1A18",
                                    color: "#FAFAF8"
                                }}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={countdown > 0}
                                    className="text-sm hover:underline disabled:opacity-50"
                                    style={{ color: "#5F5E5A" }}
                                >
                                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    placeholder="Min 6 characters"
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1" style={{ color: "#1A1A18" }}>
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    style={{ borderColor: "rgba(26,26,24,0.2)" }}
                                    placeholder="Confirm your password"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg font-bold transition-all"
                                style={{
                                    background: loading ? "#B4B2A9" : "#1A1A18",
                                    color: "#FAFAF8"
                                }}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
