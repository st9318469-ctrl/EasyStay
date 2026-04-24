import { useId, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const AUTH_IMAGES = [
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
];

// OTP Modal Component
const OTPModal = ({ email, onClose, onSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (!email) {
      setError('Missing email. Please register/login again.');
      return;
    }
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.post(`${apiUrl}/api/auth/verify-email`, {
        email,
        otp: otpCode
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

  const handleResend = async () => {
    if (countdown > 0) return;
    if (!email) {
      setError('Missing email. Please register/login again.');
      return;
    }
    
    setResendLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      await axios.post(`${apiUrl}/api/auth/resend-otp`, { email });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">×</button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Verify Your Email</h3>
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to<br />
            <strong>{email}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center bg-red-50 text-red-500">
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
              className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:border-black outline-none"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium bg-black text-white mb-3 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resendLoading}
            className="text-sm text-gray-500 hover:text-black disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AuthPage() {
  const instanceId = useId();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("guest");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", phone: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const img = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < instanceId.length; i++) {
      hash = (hash * 31 + instanceId.charCodeAt(i)) >>> 0;
    }
    return AUTH_IMAGES[hash % AUTH_IMAGES.length];
  }, [instanceId]);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!isLogin && !form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (!isLogin && form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    setErrors(prev => ({ ...prev, submit: "" }));

    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const url = isLogin ? `${apiBaseUrl}/api/auth/login` : `${apiBaseUrl}/api/auth/register`;

    try {
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, phone: form.phone, role };

      const { data } = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!isLogin && data.requiresVerification) {
        // Show OTP modal for verification
        setPendingEmail(data.email);
        setShowOTPModal(true);
        setSubmitting(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSubmitted(true);
      }
    } catch (err) {
      const message = err.response?.data?.message || (isLogin ? "Sign in failed" : "Sign up failed");
      
      // Check if verification is required
      if (err.response?.data?.requiresVerification) {
        setPendingEmail(err.response.data.email);
        setShowOTPModal(true);
      } else {
        setErrors(prev => ({ ...prev, submit: message }));
      }
    } finally {
      if (!showOTPModal) {
        setSubmitting(false);
      }
    }
  };

  const handleVerificationSuccess = () => {
    setSubmitted(true);
  };

  const inputStyle = (field) => ({
    width: "100%", outline: "none",
    border: `1.5px solid ${errors[field] ? "#E24B4A" : "rgba(26,26,24,0.2)"}`,
    borderRadius: "10px", padding: "10px 14px",
    fontSize: "13px", color: "#1A1A18",
    background: "#FAFAF8", transition: "border 0.2s ease",
    fontFamily: "inherit",
  });

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F1EFE8" }}>
        <div style={{
          background: "#FAFAF8", borderRadius: "20px",
          padding: "48px 40px", textAlign: "center",
          border: "1px solid rgba(26,26,24,0.12)",
          maxWidth: "400px", width: "90%",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "#1A1A18", color: "#FAFAF8",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "24px",
          }}>✓</div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#1A1A18", marginBottom: "8px" }}>
            {isLogin ? "Welcome back!" : "Account created!"}
          </h2>
          <p style={{ fontSize: "13px", color: "#5F5E5A", marginBottom: "24px" }}>
            {isLogin
              ? `Signed in as ${form.email}`
              : `Welcome to EasyStay, ${form.name}!`}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", password: "", confirm: "", phone: "" });
              navigate("/");
            }}
            style={{
              background: "#1A1A18", color: "#FAFAF8",
              borderRadius: "10px", padding: "11px 28px",
              fontSize: "13px", fontWeight: "700",
              border: "none", cursor: "pointer",
            }}>
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F1EFE8", padding: "24px 16px" }}>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-2xl" style={{
          maxWidth: "960px",
          border: "1px solid rgba(26,26,24,0.12)",
          boxShadow: "0 20px 60px rgba(26,26,24,0.12)",
        }}>
          {/* Left Panel */}
          <div className="relative hidden lg:block" style={{ minHeight: "560px" }}>
            <img src={img} alt="EasyStay" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(26,26,24,0.2) 0%, rgba(26,26,24,0.65) 100%)" }} />
            <div className="absolute top-6 left-6">
              <p style={{ fontSize: "22px", fontWeight: "800", color: "#FAFAF8", fontFamily: "Georgia,serif" }}>EasyStay</p>
            </div>
            <div className="absolute bottom-8 left-6 right-6">
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#FAFAF8", fontFamily: "Georgia,serif", marginBottom: "10px" }}>
                Find your perfect escape, wherever you go.
              </p>
              <div className="flex gap-4">
                {[
                  { value: "10K+", label: "Properties" },
                  { value: "50K+", label: "Guests" },
                  { value: "4.9", label: "Rating" },
                ].map(stat => (
                  <div key={stat.label}>
                    <p style={{ fontSize: "16px", fontWeight: "800", color: "#FAFAF8" }}>{stat.value}</p>
                    <p style={{ fontSize: "10px", color: "rgba(250,250,248,0.65)" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ background: "#FAFAF8", padding: "40px 36px" }}>
            <p className="lg:hidden text-center mb-5" style={{ fontSize: "20px", fontWeight: "800", color: "#1A1A18", fontFamily: "Georgia,serif" }}>
              EasyStay
            </p>

            {/* Tabs */}
            <div className="flex gap-0 mb-6" style={{ borderBottom: "1px solid rgba(26,26,24,0.1)" }}>
              {["Login", "Sign Up"].map(tab => (
                <button key={tab}
                  onClick={() => { setIsLogin(tab === "Login"); setErrors({}); }}
                  style={{
                    flex: 1, padding: "10px", fontSize: "14px", fontWeight: "700",
                    background: "transparent", border: "none",
                    color: (isLogin ? tab === "Login" : tab === "Sign Up") ? "#1A1A18" : "#B4B2A9",
                    borderBottom: (isLogin ? tab === "Login" : tab === "Sign Up") ? "2px solid #1A1A18" : "2px solid transparent",
                    marginBottom: "-1px", cursor: "pointer"
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-5">
              <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1A1A18", fontFamily: "Georgia,serif", marginBottom: "4px" }}>
                {isLogin ? "Welcome back" : "Create account"}
              </h1>
              <p style={{ fontSize: "13px", color: "#5F5E5A" }}>
                {isLogin ? "Sign in to continue your journey" : "Join thousands of happy travelers"}
              </p>
            </div>

            {/* Role selector for Sign Up */}
            {!isLogin && (
              <div className="flex gap-2 mb-4">
                {["guest", "host"].map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    style={{
                      flex: 1, padding: "8px", borderRadius: "10px", fontSize: "12px",
                      fontWeight: "700", cursor: "pointer", border: "1.5px solid #1A1A18",
                      background: role === r ? "#1A1A18" : "transparent",
                      color: role === r ? "#FAFAF8" : "#1A1A18",
                      textTransform: "capitalize"
                    }}>
                    {r === "guest" ? "🧳 I'm a Guest" : "🏠 I'm a Host"}
                  </button>
                ))}
              </div>
            )}

            {/* Form */}
            <div className="flex flex-col gap-3">
              {!isLogin && (
                <div>
                  <label style={{ fontSize: "10px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase", marginBottom: "5px", display: "block" }}>
                    Full Name
                  </label>
                  <input type="text" placeholder="John Doe"
                    value={form.name} onChange={e => update("name", e.target.value)}
                    style={inputStyle("name")} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
              )}

              <div>
                <label style={{ fontSize: "10px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase", marginBottom: "5px", display: "block" }}>
                  Email
                </label>
                <input type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => update("email", e.target.value)}
                  style={inputStyle("email")} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label style={{ fontSize: "10px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase", marginBottom: "5px", display: "block" }}>
                    Phone (Optional)
                  </label>
                  <input type="tel" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => update("phone", e.target.value)}
                    style={inputStyle("phone")} />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label style={{ fontSize: "10px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase" }}>
                    Password
                  </label>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={form.password} onChange={e => update("password", e.target.value)}
                    style={{ ...inputStyle("password"), paddingRight: "40px" }} />
                  <button onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                {isLogin && (
                  <div className="flex justify-end mt-1">
                    <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: "#5F5E5A" }}>
                      Forgot password?
                    </Link>
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label style={{ fontSize: "10px", fontWeight: "700", color: "#1A1A18", textTransform: "uppercase", marginBottom: "5px", display: "block" }}>
                    Confirm Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={form.confirm} onChange={e => update("confirm", e.target.value)}
                      style={{ ...inputStyle("confirm"), paddingRight: "40px" }} />
                    <button onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-5 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                background: "#1A1A18", color: "#FAFAF8",
                borderRadius: "12px", padding: "13px",
                fontSize: "14px", fontWeight: "700",
                border: "none", cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.75 : 1,
              }}>
              {isLogin ? "Sign In →" : "Create Account →"}
            </button>

            {errors.submit && (
              <p className="text-sm text-red-500 text-center mt-3">{errors.submit}</p>
            )}

            <p className="text-xs text-center text-gray-500 mt-4">
              {isLogin ? "New to EasyStay? " : "Already have an account? "}
              <a onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                className="font-bold text-black cursor-pointer hover:underline">
                {isLogin ? "Create account" : "Sign in"}
              </a>
            </p>

            {!isLogin && (
              <p className="text-xs text-center text-gray-400 mt-3">
                By creating an account you agree to our Terms & Privacy Policy
              </p>
            )}
          </div>
        </div>
      </div>

      {showOTPModal && (
        <OTPModal
          email={pendingEmail}
          onClose={() => {
            setShowOTPModal(false);
            setSubmitting(false);
          }}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </>
  );
}
