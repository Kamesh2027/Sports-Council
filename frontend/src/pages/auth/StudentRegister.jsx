import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/register.css";
import logo from "../../assets/icons/logo1.png";

const DEPARTMENTS = [
    { code: "CSE", name: "Computer Science & Engineering" },
    { code: "IT", name: "Information Technology" },
    { code: "AIDS", name: "Artificial Intelligence & Data Science" },
    { code: "AIML", name: "Artificial Intelligence & Machine Learning" },
    { code: "ECE", name: "Electronics & Communication Engineering" },
    { code: "EEE", name: "Electrical & Electronics Engineering" },
    { code: "MECH", name: "Mechanical Engineering" },
    { code: "CIVIL", name: "Civil Engineering" },
    { code: "CSBS", name: "Computer Science & Business Systems" },
    { code: "BME", name: "Biomedical Engineering" },
    { code: "BT", name: "Biotechnology" },
    { code: "FT", name: "Food Technology" },
    { code: "TXT", name: "Textile Technology" },
    { code: "MCA", name: "Master of Computer Applications" },
    { code: "MBA", name: "Master of Business Administration" },
    { code: "OTHER", name: "Other Department" }
];

const StudentRegister = () => {
    const navigate = useNavigate();

    // Form fields
    const [name, setName] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [coachUserId, setCoachUserId] = useState("COACH001");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [department, setDepartment] = useState("CSE - Computer Science & Engineering");
    const [year, setYear] = useState(1);

    // Email OTP states
    const [emailOtp, setEmailOtp] = useState("");
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailOtpLoading, setEmailOtpLoading] = useState(false);
    const [emailTimer, setEmailTimer] = useState(0);

    // Notification / Coach / UI states
    const [statusMessage, setStatusMessage] = useState("");
    const [coaches, setCoaches] = useState([
        { userId: "COACH001", name: "Sports Coach", sport: "General Athletics" }
    ]);
    const [customCoach, setCustomCoach] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [registeredStudent, setRegisteredStudent] = useState(null);

    const apiHost = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
    const API_BASE = `http://${apiHost}:5000/api`;

    // Load available coaches
    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const res = await axios.get(`${API_BASE}/auth/coaches`);
                if (res.data.coaches && res.data.coaches.length > 0) {
                    setCoaches(res.data.coaches);
                    setCoachUserId(res.data.coaches[0].userId || "COACH001");
                }
            } catch (err) {
                console.warn("Could not load coaches list:", err.message);
            }
        };
        fetchCoaches();
    }, []);

    // Email OTP Countdown timer
    useEffect(() => {
        let interval = null;
        if (emailTimer > 0) {
            interval = setInterval(() => {
                setEmailTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [emailTimer]);

    // Send Email OTP handler
    const handleSendEmailOtp = async () => {
        setError("");
        setStatusMessage("");

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address first.");
            return;
        }

        setEmailOtpLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/auth/send-email-otp`, {
                email: email.trim().toLowerCase()
            });

            setEmailOtpSent(true);
            setEmailTimer(60);
            setStatusMessage(res.data.message || `Verification code sent to ${email.trim()}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send email verification OTP.");
        } finally {
            setEmailOtpLoading(false);
        }
    };

    // Verify Email OTP handler
    const handleVerifyEmailOtp = async () => {
        setError("");
        setStatusMessage("");

        if (!emailOtp || emailOtp.trim().length !== 6) {
            setError("Please enter the 6-digit verification code sent to your email.");
            return;
        }

        setEmailOtpLoading(true);
        try {
            await axios.post(`${API_BASE}/auth/verify-email-otp`, {
                email: email.trim().toLowerCase(),
                otp: emailOtp.trim()
            });

            setEmailVerified(true);
            setStatusMessage("Email verified successfully! ✓");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired email verification code.");
        } finally {
            setEmailOtpLoading(false);
        }
    };

    // Registration submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!emailVerified) {
            setError("Please verify your institutional email address using OTP before registering.");
            return;
        }

        if (!phone || !/^\d{10}$/.test(phone.trim())) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (!coachUserId) {
            setError("Please select or enter an existing Coach ID.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: name.trim(),
                rollNumber: rollNumber.trim(),
                email: email.trim().toLowerCase(),
                emailOtp: emailOtp.trim(),
                phone: phone.trim(),
                coachUserId: coachUserId.trim(),
                password,
                department,
                year: Number(year)
            };

            const res = await axios.post(
                `${API_BASE}/auth/register-student`,
                payload
            );

            setRegisteredStudent(res.data.student || {
                name,
                registerNumber: rollNumber,
                email,
                phone,
                coachName: coachUserId
            });
        } catch (err) {
            console.error("Registration error:", err);
            setError(
                err.response?.data?.message ||
                "Student registration failed. Please check your inputs and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Success State Screen
    if (registeredStudent) {
        return (
            <div className="register-page" style={{ justifyContent: "center", alignItems: "center", padding: "40px 16px" }}>
                <div
                    className="glass-panel"
                    style={{
                        maxWidth: "480px",
                        width: "100%",
                        padding: "36px 28px",
                        borderRadius: "16px",
                        textAlign: "center",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                        border: "1px solid rgba(5, 199, 238, 0.3)",
                        margin: "auto"
                    }}
                >
                    <div
                        style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "rgba(5, 199, 238, 0.15)",
                            color: "#05c7ee",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "28px",
                            margin: "0 auto 20px",
                            border: "1px solid #05c7ee"
                        }}
                    >
                        ✓
                    </div>

                    <h1 style={{ fontSize: "24px", color: "#e7edf2", marginBottom: "8px" }}>
                        Registration Submitted!
                    </h1>

                    <div
                        style={{
                            display: "inline-block",
                            padding: "6px 14px",
                            background: "#382b0b",
                            color: "#e8a91b",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                            marginBottom: "18px",
                            textTransform: "uppercase"
                        }}
                    >
                        ⏳ Pending Admin Approval
                    </div>

                    <p style={{ color: "#9da9b4", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
                        Hello <strong style={{ color: "#ffffff" }}>{registeredStudent.name}</strong>, your student profile has been created with Roll Number <strong style={{ color: "#05c7ee" }}>{registeredStudent.registerNumber}</strong>.
                    </p>

                    <div
                        style={{
                            background: "#171c22",
                            border: "1px solid #303740",
                            borderRadius: "8px",
                            padding: "16px",
                            textAlign: "left",
                            marginBottom: "24px",
                            fontSize: "13px"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#8da3b5" }}>Assigned Coach:</span>
                            <strong style={{ color: "#05c7ee" }}>{registeredStudent.coachName || coachUserId}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#8da3b5" }}>Verified Email:</span>
                            <span style={{ color: "#35d49b" }}>{registeredStudent.email} ✓</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ color: "#8da3b5" }}>Mobile Number:</span>
                            <span style={{ color: "#e7edf2" }}>+91 {registeredStudent.phone}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#8da3b5" }}>Login Access:</span>
                            <span style={{ color: "#e8a91b", fontWeight: 700 }}>Requires Admin Approval</span>
                        </div>
                    </div>

                    <p style={{ fontSize: "12px", color: "#76838e", marginBottom: "24px" }}>
                        The Sports Council Administrator will review and approve your profile. Once approved, you can sign in using your registered email and password.
                    </p>

                    <button
                        className="register-submit"
                        onClick={() => navigate("/login")}
                        style={{ width: "100%", padding: "12px", fontSize: "15px" }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page">
            <div className="register-form-wrap">
                <div className="register-box glass-panel">
                    <div className="register-header">
                        <img
                            className="register-logo-mobile"
                            alt="BIT Sports Council Logo"
                            src={logo}
                        />
                        <h1>Student Registration</h1>
                        <p>Verify your institutional email to register as a student athlete.</p>
                    </div>

                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}

                    {statusMessage && (
                        <div
                            style={{
                                background: emailVerified ? "rgba(12, 51, 41, 0.9)" : "rgba(7, 53, 66, 0.9)",
                                border: emailVerified ? "1px solid #35d49b" : "1px solid #05c7ee",
                                color: emailVerified ? "#35d49b" : "#05c7ee",
                                padding: "12px 14px",
                                borderRadius: "6px",
                                fontSize: "13px",
                                marginBottom: "16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                lineHeight: "1.4"
                            }}
                        >
                            <span style={{ fontSize: "16px" }}>{emailVerified ? "✓" : "✉️"}</span>
                            <span>{statusMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        {/* FULL NAME */}
                        <div className="field">
                            <label htmlFor="fullName">Full Name *</label>
                            <div className="field-input">
                                <span className="field-icon">👤</span>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="e.g. Rahul Sharma"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* ROLL NUMBER / REGISTER NUMBER */}
                        <div className="field">
                            <label htmlFor="rollNumber">Roll / Register Number *</label>
                            <div className="field-input">
                                <span className="field-icon">🆔</span>
                                <input
                                    id="rollNumber"
                                    type="text"
                                    placeholder="e.g. 7376222CS101"
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* INSTITUTIONAL EMAIL & OTP VERIFICATION */}
                        <div className="field">
                            <label htmlFor="email">
                                Institutional Email (with OTP Verification) *
                            </label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <div className="field-input" style={{ flex: 1 }}>
                                    <span className="field-icon">✉️</span>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="student@bit.edu / gmail.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setEmailVerified(false);
                                        }}
                                        disabled={emailVerified}
                                        required
                                    />
                                </div>

                                {!emailVerified && (
                                    <button
                                        type="button"
                                        onClick={handleSendEmailOtp}
                                        disabled={emailOtpLoading || emailTimer > 0 || !email.includes("@")}
                                        style={{
                                            padding: "0 14px",
                                            background: email.includes("@") ? "#05c7ee" : "#2b323a",
                                            color: email.includes("@") ? "#07131a" : "#76838e",
                                            border: "none",
                                            borderRadius: "6px",
                                            fontWeight: 700,
                                            fontSize: "12px",
                                            cursor: email.includes("@") ? "pointer" : "not-allowed",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {emailOtpLoading
                                            ? "Sending..."
                                            : emailTimer > 0
                                            ? `Resend (${emailTimer}s)`
                                            : emailOtpSent
                                            ? "Resend Code"
                                            : "Send Code"}
                                    </button>
                                )}

                                {emailVerified && (
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            background: "#0c3329",
                                            color: "#35d49b",
                                            padding: "0 12px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: 700
                                        }}
                                    >
                                        <span>✓</span> Verified
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* EMAIL OTP INPUT */}
                        {emailOtpSent && !emailVerified && (
                            <div
                                className="field"
                                style={{
                                    background: "rgba(5, 199, 238, 0.08)",
                                    border: "1px solid #05c7ee",
                                    padding: "14px",
                                    borderRadius: "8px"
                                }}
                            >
                                <label htmlFor="emailOtpCode" style={{ color: "#05c7ee", display: "block", marginBottom: "6px" }}>
                                    Enter 6-Digit Email Verification Code *
                                </label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <div className="field-input" style={{ flex: 1 }}>
                                        <span className="field-icon">🔑</span>
                                        <input
                                            id="emailOtpCode"
                                            type="text"
                                            maxLength="6"
                                            placeholder="Enter 6-digit code from email"
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            style={{ letterSpacing: "4px", fontWeight: 700 }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleVerifyEmailOtp}
                                        disabled={emailOtpLoading || emailOtp.length !== 6}
                                        style={{
                                            padding: "0 16px",
                                            background: emailOtp.length === 6 ? "#35d49b" : "#2b323a",
                                            color: emailOtp.length === 6 ? "#07131a" : "#76838e",
                                            border: "none",
                                            borderRadius: "6px",
                                            fontWeight: 800,
                                            fontSize: "12px",
                                            cursor: emailOtp.length === 6 ? "pointer" : "not-allowed"
                                        }}
                                    >
                                        {emailOtpLoading ? "Verifying..." : "Verify Email ✓"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* MOBILE NUMBER (STANDARD FIELD - NO OTP REQUIRED) */}
                        <div className="field">
                            <label htmlFor="mobile">Mobile Number *</label>
                            <div className="field-input">
                                <span className="field-icon">📱</span>
                                <input
                                    id="mobile"
                                    type="tel"
                                    placeholder="10-digit mobile number (e.g. 9876543210)"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    required
                                />
                            </div>
                        </div>

                        {/* EXISTING COACH ID */}
                        <div className="field">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                <label htmlFor="coachSelect" style={{ margin: 0 }}>Existing Coach *</label>
                                <button
                                    type="button"
                                    onClick={() => setCustomCoach(!customCoach)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#05c7ee",
                                        fontSize: "11px",
                                        cursor: "pointer",
                                        fontWeight: 600
                                    }}
                                >
                                    {customCoach ? "← Choose from dropdown list" : "Enter Coach ID manually →"}
                                </button>
                            </div>

                            {customCoach ? (
                                <div className="field-input">
                                    <span className="field-icon">📋</span>
                                    <input
                                        id="coachSelect"
                                        type="text"
                                        placeholder="e.g. COACH001"
                                        value={coachUserId}
                                        onChange={(e) => setCoachUserId(e.target.value)}
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="field-input" style={{ position: "relative" }}>
                                    <span className="field-icon">🏅</span>
                                    <select
                                        id="coachSelect"
                                        value={coachUserId}
                                        onChange={(e) => setCoachUserId(e.target.value)}
                                        style={{
                                            width: "100%",
                                            background: "#171c22",
                                            border: "1px solid #3c494e",
                                            borderRadius: "6px",
                                            padding: "12px 36px 12px 40px",
                                            color: "#ffffff",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            outline: "none",
                                            cursor: "pointer",
                                            display: "block"
                                        }}
                                        required
                                    >
                                        {coaches.map((c) => (
                                            <option
                                                key={c.userId || c._id}
                                                value={c.userId}
                                                style={{ background: "#171c22", color: "#ffffff", padding: "10px", fontSize: "14px" }}
                                            >
                                                {c.name} ({c.sport || "Athletics"}) — Team: {c.teamName || `${c.sport || "General"} Team`} [ID: {c.userId}]
                                            </option>
                                        ))}
                                    </select>
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: "14px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            pointerEvents: "none",
                                            color: "#05c7ee",
                                            fontSize: "12px",
                                            fontWeight: 800
                                        }}
                                    >
                                        ▼
                                    </div>
                                </div>
                            )}
                            {/* Selected Coach & Team Info Banner */}
                            {!customCoach && coaches.find((c) => c.userId === coachUserId) && (
                                <div
                                    style={{
                                        marginTop: "8px",
                                        padding: "8px 12px",
                                        background: "rgba(5, 199, 238, 0.08)",
                                        border: "1px solid rgba(5, 199, 238, 0.25)",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        fontSize: "12px"
                                    }}
                                >
                                    <span style={{ color: "#8da3b5" }}>Assigned Team / Squad:</span>
                                    <strong style={{ color: "#05c7ee", display: "flex", alignItems: "center", gap: "6px" }}>
                                        🏆 {coaches.find((c) => c.userId === coachUserId)?.teamName || `${coaches.find((c) => c.userId === coachUserId)?.sport || "General"} Team`}
                                    </strong>
                                </div>
                            )}
                        </div>

                        {/* DEPARTMENT & YEAR */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "10px" }}>
                            {/* DEPARTMENT DROPDOWN */}
                            <div className="field">
                                <label htmlFor="dept">Department *</label>
                                <div className="field-input" style={{ position: "relative" }}>
                                    <span className="field-icon">🏛️</span>
                                    <select
                                        id="dept"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        style={{
                                            width: "100%",
                                            background: "#171c22",
                                            border: "1px solid #3c494e",
                                            borderRadius: "6px",
                                            padding: "12px 30px 12px 40px",
                                            color: "#ffffff",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            outline: "none",
                                            cursor: "pointer"
                                        }}
                                        required
                                    >
                                        {DEPARTMENTS.map((d) => (
                                            <option
                                                key={d.code}
                                                value={`${d.code} - ${d.name}`}
                                                style={{ background: "#171c22", color: "#ffffff", padding: "10px" }}
                                            >
                                                {d.code} — {d.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            pointerEvents: "none",
                                            color: "#05c7ee",
                                            fontSize: "11px"
                                        }}
                                    >
                                        ▼
                                    </div>
                                </div>
                            </div>

                            {/* ACADEMIC YEAR DROPDOWN */}
                            <div className="field">
                                <label htmlFor="year">Academic Year *</label>
                                <div className="field-input" style={{ position: "relative" }}>
                                    <span className="field-icon">🎓</span>
                                    <select
                                        id="year"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        style={{
                                            width: "100%",
                                            background: "#171c22",
                                            border: "1px solid #3c494e",
                                            borderRadius: "6px",
                                            padding: "12px 30px 12px 40px",
                                            color: "#ffffff",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            outline: "none",
                                            cursor: "pointer"
                                        }}
                                        required
                                    >
                                        <option value={1} style={{ background: "#171c22", color: "#fff" }}>1st Year</option>
                                        <option value={2} style={{ background: "#171c22", color: "#fff" }}>2nd Year</option>
                                        <option value={3} style={{ background: "#171c22", color: "#fff" }}>3rd Year</option>
                                        <option value={4} style={{ background: "#171c22", color: "#fff" }}>4th Year</option>
                                    </select>
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            pointerEvents: "none",
                                            color: "#05c7ee",
                                            fontSize: "11px"
                                        }}
                                    >
                                        ▼
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="field">
                            <label htmlFor="password">Password *</label>
                            <div className="field-input">
                                <span className="field-icon">🔒</span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
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

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            className="register-submit"
                            disabled={loading || !emailVerified}
                            style={{
                                marginTop: "10px",
                                opacity: emailVerified ? 1 : 0.65,
                                cursor: emailVerified ? "pointer" : "not-allowed"
                            }}
                        >
                            {loading
                                ? "Submitting Registration..."
                                : emailVerified
                                ? "Register as Student →"
                                : "Verify Email OTP to Register"}
                        </button>
                    </form>

                    <div className="register-links">
                        <p>
                            Already registered?{" "}
                            <button type="button" onClick={() => navigate("/login")}>
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRegister;