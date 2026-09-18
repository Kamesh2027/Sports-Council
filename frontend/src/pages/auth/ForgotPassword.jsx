import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/login.css";
import logo from "../../assets/icons/logo1.png";

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Flow Step: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
    const [step, setStep] = useState(1);

    // Form inputs
    const [email, setEmail] = useState("");
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const otpInputRefs = useRef([]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Status / UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [devOtp, setDevOtp] = useState("");

    const apiHost = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
    const API_BASE = `http://${apiHost}:5000/api`;

    // Resend countdown timer
    useEffect(() => {
        let interval = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Handle 6-box OTP digit input
    const handleOtpDigitChange = (index, value) => {
        const cleanVal = value.replace(/\D/g, "");

        if (!cleanVal) {
            const newDigits = [...otpDigits];
            newDigits[index] = "";
            setOtpDigits(newDigits);
            return;
        }

        if (cleanVal.length > 1) {
            const pasted = cleanVal.slice(0, 6).split("");
            const newDigits = [...otpDigits];
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pasted[i] || "";
            }
            setOtpDigits(newDigits);
            const nextFocus = Math.min(pasted.length, 5);
            otpInputRefs.current[nextFocus]?.focus();
            return;
        }

        const newDigits = [...otpDigits];
        newDigits[index] = cleanVal;
        setOtpDigits(newDigits);

        if (index < 5 && cleanVal) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace navigation between OTP boxes
    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otpDigits[index] && index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    // Handle paste across 6 boxes
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData) {
            const newDigits = ["", "", "", "", "", ""];
            for (let i = 0; i < pastedData.length; i++) {
                newDigits[i] = pastedData[i];
            }
            setOtpDigits(newDigits);
            const nextFocus = Math.min(pastedData.length, 5);
            otpInputRefs.current[nextFocus]?.focus();
        }
    };

    // STEP 1: Send Password Reset OTP
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid registered email address.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/auth/forgot-password`, {
                email: email.trim().toLowerCase()
            });

            setSuccessMsg(res.data.message || `Verification code sent to ${email}.`);
            if (res.data.devOtp) {
                setDevOtp(res.data.devOtp);
            }
            setResendTimer(60);
            setStep(2);
            // Clear previous digits
            setOtpDigits(["", "", "", "", "", ""]);
            setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 100);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setSuccessMsg("");

        const code = otpDigits.join("").trim();
        if (code.length !== 6) {
            setError("Please enter all 6 digits of the verification code.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/auth/verify-reset-otp`, {
                email: email.trim().toLowerCase(),
                otp: code
            });

            setSuccessMsg(res.data.message || "Code verified successfully!");
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired verification code.");
        } finally {
            setLoading(false);
        }
    };

    // STEP 3: Reset Password
    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!newPassword || newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please re-enter.");
            return;
        }

        setLoading(true);
        try {
            const code = otpDigits.join("").trim();
            const res = await axios.post(`${API_BASE}/auth/reset-password`, {
                email: email.trim().toLowerCase(),
                otp: code,
                newPassword,
                confirmPassword
            });

            setSuccessMsg(res.data.message || "Password reset successfully!");
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-grid" />
            <div className="login-glow login-glow-top" />
            <div className="login-glow login-glow-bottom" />

            <main className="login-main">
                {/* Left: Branding Panel */}
                <div className="login-promo glass-panel">
                    <div className="login-promo-content">
                        <img src={logo} alt="BIT Sports Council Logo" className="logo-img" />
                        <h1>
                            Secure
                            <br />
                            Account Reset.
                        </h1>
                        <p>
                            Verify your institutional identity to safely recover your credentials and regain access to the sports management ecosystem.
                        </p>
                    </div>

                    <div className="login-promo-tags">
                        <span>
                            <span className="material-symbols-outlined">verified_user</span>
                            Email Verification
                        </span>
                        <span className="login-dot" />
                        <span>
                            <span className="material-symbols-outlined">lock_reset</span>
                            Instant Reset
                        </span>
                    </div>
                </div>

                {/* Right: Form Panel */}
                <div className="login-form-wrap">
                    <div className="login-box glass-panel" style={{ maxWidth: "480px" }}>
                        {/* Mobile Header Logo */}
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <img
                                src={logo}
                                alt="BIT Sports Council Logo"
                                style={{ width: "48px", height: "48px", borderRadius: "8px", margin: "0 auto 10px", display: "inline-block" }}
                            />
                            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#ffffff", margin: "0 0 6px" }}>
                                {step === 1 && "Forgot Password?"}
                                {step === 2 && "Enter Verification Code"}
                                {step === 3 && "Set New Password"}
                                {step === 4 && "Password Reset Complete"}
                            </h2>
                            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", margin: 0 }}>
                                {step === 1 && "Enter your registered email to receive a 6-digit verification code."}
                                {step === 2 && `We sent a 6-digit code to ${email}`}
                                {step === 3 && "Create and confirm your new secure password."}
                                {step === 4 && "Your credentials have been securely updated."}
                            </p>
                        </div>

                        {/* Step Progress Indicators */}
                        {step < 4 && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
                                {[
                                    { num: 1, label: "Email" },
                                    { num: 2, label: "Verify" },
                                    { num: 3, label: "Reset" }
                                ].map((s, idx) => (
                                    <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                borderRadius: "50%",
                                                background: step === s.num ? "#05c7ee" : step > s.num ? "#35d49b" : "#1e242c",
                                                color: step === s.num ? "#07131a" : step > s.num ? "#07131a" : "#76838e",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                transition: "all 0.3s ease"
                                            }}
                                        >
                                            {step > s.num ? "✓" : s.num}
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: step === s.num ? 700 : 500,
                                                color: step === s.num ? "#05c7ee" : step > s.num ? "#35d49b" : "#76838e"
                                            }}
                                        >
                                            {s.label}
                                        </span>
                                        {idx < 2 && (
                                            <div
                                                style={{
                                                    width: "24px",
                                                    height: "2px",
                                                    background: step > s.num ? "#35d49b" : "#28313d"
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Alerts */}
                        {error && <p className="login-error" style={{ marginBottom: "16px" }}>{error}</p>}
                        {successMsg && step !== 4 && (
                            <div
                                style={{
                                    background: "rgba(53, 212, 155, 0.12)",
                                    border: "1px solid #35d49b",
                                    color: "#35d49b",
                                    padding: "10px 14px",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    marginBottom: "16px"
                                }}
                            >
                                {successMsg}
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* STEP 1: ENTER REGISTERED EMAIL */}
                        {/* ========================================================================= */}
                        {step === 1 && (
                            <form onSubmit={handleSendOtp} className="login-form">
                                <div className="field">
                                    <label htmlFor="email">Registered Email Address *</label>
                                    <div className="field-input">
                                        <span className="material-symbols-outlined field-icon">mail</span>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="e.g. yourname@bitsathy.ac.in"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="login-submit"
                                    disabled={loading || !email}
                                    style={{ marginTop: "12px" }}
                                >
                                    {loading ? "Sending Verification Code..." : "Send Verification Code"}
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </form>
                        )}

                        {/* ========================================================================= */}
                        {/* STEP 2: ENTER 6-DIGIT OTP */}
                        {/* ========================================================================= */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="login-form">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#05c7ee", letterSpacing: "0.05em" }}>
                                        6-Digit Verification Code *
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); setError(""); }}
                                        style={{ background: "none", border: "none", color: "#8da3b5", fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}
                                    >
                                        Change Email
                                    </button>
                                </div>

                                {/* 6 Square OTP Boxes */}
                                <div
                                    style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "14px 0" }}
                                    onPaste={handleOtpPaste}
                                >
                                    {otpDigits.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => (otpInputRefs.current[idx] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            style={{
                                                width: "48px",
                                                height: "52px",
                                                textAlign: "center",
                                                fontSize: "20px",
                                                fontWeight: "800",
                                                background: "#171c22",
                                                color: "#ffffff",
                                                border: digit ? "1.5px solid #05c7ee" : "1px solid #3c494e",
                                                borderRadius: "8px",
                                                outline: "none",
                                                boxShadow: digit ? "0 0 10px rgba(5, 199, 238, 0.35)" : "none",
                                                padding: 0,
                                                transition: "all 0.15s ease"
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "#05c7ee";
                                                e.target.style.boxShadow = "0 0 12px rgba(5, 199, 238, 0.4)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = digit ? "#05c7ee" : "#3c494e";
                                                e.target.style.boxShadow = digit ? "0 0 10px rgba(5, 199, 238, 0.35)" : "none";
                                            }}
                                        />
                                    ))}
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0 16px" }}>
                                    <span style={{ fontSize: "12px", color: "#8da3b5" }}>
                                        Didn't receive the code?
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={resendTimer > 0 || loading}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: resendTimer > 0 ? "#76838e" : "#05c7ee",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            cursor: resendTimer > 0 ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="login-submit"
                                    disabled={loading || otpDigits.join("").length !== 6}
                                >
                                    {loading ? "Verifying Code..." : "Verify Code & Proceed"}
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>

                                <p style={{ margin: "14px 0 0", fontSize: "11px", color: "#8da3b5", lineHeight: "1.4", textAlign: "center" }}>
                                    An email was sent from <code>sportscouncil2027@gmail.com</code>. Please check your <strong>Inbox</strong>, <strong>Spam / Junk</strong>, and <strong>Promotions</strong> folders.
                                </p>
                            </form>
                        )}

                        {/* ========================================================================= */}
                        {/* STEP 3: SET NEW PASSWORD */}
                        {/* ========================================================================= */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="login-form">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "8px 12px",
                                        background: "#0c3329",
                                        border: "1px solid #35d49b",
                                        borderRadius: "6px",
                                        marginBottom: "16px",
                                        fontSize: "12px",
                                        color: "#35d49b"
                                    }}
                                >
                                    <span>✓</span>
                                    <span>Email Verified: <strong>{email}</strong></span>
                                </div>

                                {/* New Password */}
                                <div className="field">
                                    <label htmlFor="newPassword">New Password *</label>
                                    <div className="field-input">
                                        <span className="material-symbols-outlined field-icon">lock</span>
                                        <input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password (min. 6 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: "absolute",
                                                right: "12px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                background: "none",
                                                border: "none",
                                                color: "#8da3b5",
                                                cursor: "pointer",
                                                fontSize: "14px"
                                            }}
                                        >
                                            {showPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm New Password */}
                                <div className="field">
                                    <label htmlFor="confirmPassword">Confirm New Password *</label>
                                    <div className="field-input">
                                        <span className="material-symbols-outlined field-icon">lock_clock</span>
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                position: "absolute",
                                                right: "12px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                background: "none",
                                                border: "none",
                                                color: "#8da3b5",
                                                cursor: "pointer",
                                                fontSize: "14px"
                                            }}
                                        >
                                            {showConfirmPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Validation Helpers */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "4px 0 12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: newPassword.length >= 6 ? "#35d49b" : "#76838e" }}>
                                        <span>{newPassword.length >= 6 ? "✓" : "•"}</span>
                                        <span>At least 6 characters long</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: confirmPassword && newPassword === confirmPassword ? "#35d49b" : "#76838e" }}>
                                        <span>{confirmPassword && newPassword === confirmPassword ? "✓" : "•"}</span>
                                        <span>Passwords match</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="login-submit"
                                    disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                                >
                                    {loading ? "Updating Password..." : "Reset Password & Sign In"}
                                    <span className="material-symbols-outlined">check_circle</span>
                                </button>
                            </form>
                        )}

                        {/* ========================================================================= */}
                        {/* STEP 4: SUCCESS CONFIRMATION */}
                        {/* ========================================================================= */}
                        {step === 4 && (
                            <div style={{ textAlign: "center", padding: "10px 0" }}>
                                <div
                                    style={{
                                        width: "68px",
                                        height: "68px",
                                        borderRadius: "50%",
                                        background: "rgba(53, 212, 155, 0.15)",
                                        border: "2px solid #35d49b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 16px",
                                        fontSize: "32px",
                                        color: "#35d49b"
                                    }}
                                >
                                    ✓
                                </div>

                                <p style={{ fontSize: "14px", color: "#e2e8f0", lineHeight: "1.5", marginBottom: "24px" }}>
                                    Your password has been successfully reset! You can now log into the BIT Sports Council portal with your new credentials.
                                </p>

                                <button
                                    type="button"
                                    className="login-submit"
                                    onClick={() => navigate("/login")}
                                    style={{ width: "100%" }}
                                >
                                    Proceed to Sign In
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        )}

                        {/* Back to Sign In link */}
                        {step < 4 && (
                            <div className="login-links" style={{ marginTop: "24px" }}>
                                <p>
                                    Remember your password?{" "}
                                    <button type="button" onClick={() => navigate("/login")}>
                                        Sign In
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;