import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../services/api";
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
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const otpInputRefs = useRef([]);
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailOtpLoading, setEmailOtpLoading] = useState(false);
    const [emailTimer, setEmailTimer] = useState(0);
    const [receivedDevOtp, setReceivedDevOtp] = useState("");

    // Notification / Coach / UI states
    const [statusMessage, setStatusMessage] = useState("");
    const [coaches, setCoaches] = useState([
        { userId: "COACH001", name: "Sports Coach", sport: "General Athletics" }
    ]);
    const [customCoach, setCustomCoach] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [registeredStudent, setRegisteredStudent] = useState(null);

    // Custom dropdown states & refs
    const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const [coachDropdownOpen, setCoachDropdownOpen] = useState(false);
    const deptRef = useRef(null);
    const yearRef = useRef(null);
    const coachRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (deptRef.current && !deptRef.current.contains(event.target)) {
                setDeptDropdownOpen(false);
            }
            if (yearRef.current && !yearRef.current.contains(event.target)) {
                setYearDropdownOpen(false);
            }
            if (coachRef.current && !coachRef.current.contains(event.target)) {
                setCoachDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    // Keep emailOtp string in sync with 6 digits
    useEffect(() => {
        setEmailOtp(otpDigits.join(""));
    }, [otpDigits]);

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
            // Paged/Multi-char fill
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

        // Auto-advance to next square box
        if (index < 5 && cleanVal) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace navigation between boxes
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
            const focusIndex = Math.min(pastedData.length, 5);
            otpInputRefs.current[focusIndex]?.focus();
        }
    };

    // Send Email OTP handler
    const handleSendEmailOtp = async () => {
        setError("");
        setStatusMessage("");
        setReceivedDevOtp("");
        setOtpDigits(["", "", "", "", "", ""]);

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
            if (res.data.devOtp) {
                setReceivedDevOtp(res.data.devOtp);
            }
            setStatusMessage(res.data.message || `Verification code sent to ${email.trim()}. Please check Inbox & Spam folders.`);
            setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 150);
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

        const codeToVerify = otpDigits.join("").trim();
        if (codeToVerify.length !== 6) {
            setError("Please enter all 6 digits of the verification code.");
            return;
        }

        setEmailOtpLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/auth/verify-email-otp`, {
                email: email.trim().toLowerCase(),
                otp: codeToVerify
            });

            setEmailVerified(true);
            setStatusMessage(res.data.message || "Email address verified successfully! ✓");
            setError("");
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
                                <div className="field-input" style={{ flex: 1, marginBottom: "7px" }}>
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
                                            height: "36px",
                                            alignSelf: "center",
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
                                    padding: "16px",
                                    borderRadius: "8px"
                                }}
                            >
                                <label style={{ color: "#05c7ee", display: "block", marginBottom: "10px", fontWeight: "700" }}>
                                    Enter 6-Digit Verification Code *
                                </label>

                                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                    {/* 6 SQUARE OTP BOXES */}
                                    <div
                                        style={{ display: "flex", gap: "8px", alignItems: "center" }}
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
                                                    width: "42px",
                                                    height: "46px",
                                                    textAlign: "center",
                                                    fontSize: "18px",
                                                    fontWeight: "700",
                                                    background: "#171c22",
                                                    color: "#ffffff",
                                                    border: digit ? "1.5px solid #05c7ee" : "1px solid #3c494e",
                                                    borderRadius: "8px",
                                                    outline: "none",
                                                    boxShadow: digit ? "0 0 8px rgba(5, 199, 238, 0.3)" : "none",
                                                    padding: 0,
                                                    transition: "all 0.15s ease"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = "#05c7ee";
                                                    e.target.style.boxShadow = "0 0 10px rgba(5, 199, 238, 0.35)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = digit ? "#05c7ee" : "#3c494e";
                                                    e.target.style.boxShadow = digit ? "0 0 8px rgba(5, 199, 238, 0.3)" : "none";
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* VERIFY BUTTON */}
                                    <button
                                        type="button"
                                        onClick={handleVerifyEmailOtp}
                                        disabled={emailOtpLoading || otpDigits.join("").length !== 6}
                                        style={{
                                            padding: "0 16px",
                                            height: "46px",
                                            background: otpDigits.join("").length === 6 ? "#35d49b" : "#2b323a",
                                            color: otpDigits.join("").length === 6 ? "#07131a" : "#76838e",
                                            border: "none",
                                            borderRadius: "8px",
                                            fontWeight: 700,
                                            fontSize: "12px",
                                            cursor: otpDigits.join("").length === 6 ? "pointer" : "not-allowed",
                                            whiteSpace: "nowrap",
                                            transition: "all 0.2s ease"
                                        }}
                                    >
                                        {emailOtpLoading ? "Verifying..." : "Verify Email ✓"}
                                    </button>
                                </div>

                                <p style={{ margin: "10px 0 0", fontSize: "11px", color: "#8da3b5", lineHeight: "1.4" }}>
                                    An email was sent from <code>sportscouncil2027@gmail.com</code>. Please check your <strong>Inbox</strong> and <strong>Spam / Junk</strong> folders.
                                </p>
                            </div>
                        )}

                        {/* MOBILE NUMBER (STANDARD FIELD - NO OTP REQUIRED) */}
                        <div className="field">
                            <label htmlFor="mobile">Mobile Number *</label>
                            <div className="field-input">
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
                                <div className="field-input" ref={coachRef} style={{ position: "relative" }}>
                                    <button
                                        id="coachSelect"
                                        type="button"
                                        onClick={() => {
                                            setCoachDropdownOpen(!coachDropdownOpen);
                                            setDeptDropdownOpen(false);
                                            setYearDropdownOpen(false);
                                        }}
                                        style={{
                                            width: "100%",
                                            height: "46px",
                                            background: "#171c22",
                                            border: coachDropdownOpen ? "1px solid #05c7ee" : "1px solid #3c494e",
                                            borderRadius: "6px",
                                            padding: "0 34px 0 12px",
                                            color: "#ffffff",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            outline: "none",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            textAlign: "left",
                                            boxShadow: coachDropdownOpen ? "0 0 10px rgba(5, 199, 238, 0.25)" : "none",
                                            transition: "all 0.15s ease"
                                        }}
                                    >
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {(() => {
                                                const c = coaches.find((coach) => coach.userId === coachUserId);
                                                if (c) {
                                                    return `${c.name} (${c.sport || "Athletics"}) — Team: ${c.teamName || `${c.sport || "General"} Team`} [ID: ${c.userId}]`;
                                                }
                                                return coachUserId || "Select Coach";
                                            })()}
                                        </span>
                                        <span
                                            style={{
                                                position: "absolute",
                                                right: "14px",
                                                top: "50%",
                                                transform: `translateY(-50%) ${coachDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
                                                color: "#05c7ee",
                                                fontSize: "11px",
                                                fontWeight: 800,
                                                pointerEvents: "none",
                                                transition: "transform 0.2s ease"
                                            }}
                                        >
                                            ▼
                                        </span>
                                    </button>

                                    {coachDropdownOpen && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "calc(100% + 4px)",
                                                left: 0,
                                                right: 0,
                                                background: "#171c22",
                                                border: "1px solid #3c494e",
                                                borderRadius: "8px",
                                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.75)",
                                                maxHeight: "220px",
                                                overflowY: "auto",
                                                zIndex: 9999,
                                                padding: "4px 0"
                                            }}
                                        >
                                            {coaches.map((c) => {
                                                const isSelected = c.userId === coachUserId;
                                                return (
                                                    <div
                                                        key={c.userId || c._id}
                                                        onClick={() => {
                                                            setCoachUserId(c.userId);
                                                            setCoachDropdownOpen(false);
                                                        }}
                                                        style={{
                                                            padding: "10px 14px",
                                                            fontSize: "13px",
                                                            color: isSelected ? "#05c7ee" : "#e2e8f0",
                                                            background: isSelected ? "rgba(5, 199, 238, 0.12)" : "transparent",
                                                            fontWeight: isSelected ? 700 : 500,
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            gap: "8px",
                                                            transition: "background 0.15s ease, color 0.15s ease"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isSelected) {
                                                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                                                e.currentTarget.style.color = "#ffffff";
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = isSelected ? "rgba(5, 199, 238, 0.12)" : "transparent";
                                                            e.currentTarget.style.color = isSelected ? "#05c7ee" : "#e2e8f0";
                                                        }}
                                                    >
                                                        <span>{c.name} ({c.sport || "Athletics"}) — Team: {c.teamName || `${c.sport || "General"} Team`} [ID: {c.userId}]</span>
                                                        {isSelected && <span style={{ color: "#05c7ee", fontWeight: "bold" }}>✓</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* DEPARTMENT & YEAR */}
                        <div style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: "10px" }}>
                            {/* DEPARTMENT DROPDOWN */}
                            <div className="field" ref={deptRef} style={{ position: "relative" }}>
                                <label htmlFor="dept" style={{ whiteSpace: "nowrap" }}>Department *</label>
                                <div className="field-input" style={{ position: "relative" }}>
                                    <button
                                        id="dept"
                                        type="button"
                                        onClick={() => {
                                            setDeptDropdownOpen(!deptDropdownOpen);
                                            setYearDropdownOpen(false);
                                            setCoachDropdownOpen(false);
                                        }}
                                        style={{
                                            width: "100%",
                                            height: "46px",
                                            background: "#171c22",
                                            border: deptDropdownOpen ? "1px solid #05c7ee" : "1px solid #3c494e",
                                            borderRadius: "6px",
                                            padding: "0 30px 0 12px",
                                            color: "#ffffff",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            textAlign: "left",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            outline: "none",
                                            boxShadow: deptDropdownOpen ? "0 0 10px rgba(5, 199, 238, 0.25)" : "none",
                                            transition: "all 0.15s ease"
                                        }}
                                    >
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {department ? department.replace(" - ", " — ") : "Select Department"}
                                        </span>
                                        <span
                                            style={{
                                                position: "absolute",
                                                right: "12px",
                                                top: "50%",
                                                transform: `translateY(-50%) ${deptDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
                                                color: "#05c7ee",
                                                fontSize: "11px",
                                                transition: "transform 0.2s ease",
                                                pointerEvents: "none"
                                            }}
                                        >
                                            ▼
                                        </span>
                                    </button>

                                    {deptDropdownOpen && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "calc(100% + 4px)",
                                                left: 0,
                                                right: 0,
                                                background: "#171c22",
                                                border: "1px solid #3c494e",
                                                borderRadius: "8px",
                                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.75)",
                                                maxHeight: "220px",
                                                overflowY: "auto",
                                                zIndex: 9999,
                                                padding: "4px 0"
                                            }}
                                        >
                                            {DEPARTMENTS.map((d) => {
                                                const deptVal = `${d.code} - ${d.name}`;
                                                const isSelected = department === deptVal;
                                                return (
                                                    <div
                                                        key={d.code}
                                                        onClick={() => {
                                                            setDepartment(deptVal);
                                                            setDeptDropdownOpen(false);
                                                        }}
                                                        style={{
                                                            padding: "10px 14px",
                                                            fontSize: "13px",
                                                            color: isSelected ? "#05c7ee" : "#e2e8f0",
                                                            background: isSelected ? "rgba(5, 199, 238, 0.12)" : "transparent",
                                                            fontWeight: isSelected ? 700 : 500,
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            transition: "background 0.15s ease, color 0.15s ease"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isSelected) {
                                                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                                                e.currentTarget.style.color = "#ffffff";
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = isSelected ? "rgba(5, 199, 238, 0.12)" : "transparent";
                                                            e.currentTarget.style.color = isSelected ? "#05c7ee" : "#e2e8f0";
                                                        }}
                                                    >
                                                        <span>{d.code} — {d.name}</span>
                                                        {isSelected && <span style={{ color: "#05c7ee", fontWeight: "bold" }}>✓</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ACADEMIC YEAR DROPDOWN */}
                            <div className="field" ref={yearRef} style={{ position: "relative" }}>
                                <label htmlFor="year" style={{ whiteSpace: "nowrap" }}>Academic Year *</label>
                                <div className="field-input" style={{ position: "relative" }}>
                                    <button
                                        id="year"
                                        type="button"
                                        onClick={() => {
                                            setYearDropdownOpen(!yearDropdownOpen);
                                            setDeptDropdownOpen(false);
                                            setCoachDropdownOpen(false);
                                        }}
                                        style={{
                                            width: "100%",
                                            height: "46px",
                                            background: "#171c22",
                                            border: yearDropdownOpen ? "1px solid #05c7ee" : "1px solid #3c494e",
                                            borderRadius: "6px",
                                            padding: "0 28px 0 12px",
                                            color: "#ffffff",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            textAlign: "left",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            outline: "none",
                                            whiteSpace: "nowrap",
                                            boxShadow: yearDropdownOpen ? "0 0 10px rgba(5, 199, 238, 0.25)" : "none",
                                            transition: "all 0.15s ease"
                                        }}
                                    >
                                        <span style={{ whiteSpace: "nowrap" }}>
                                            {Number(year) === 1
                                                ? "1st Year"
                                                : Number(year) === 2
                                                ? "2nd Year"
                                                : Number(year) === 3
                                                ? "3rd Year"
                                                : Number(year) === 4
                                                ? "4th Year"
                                                : `${year}th Year`}
                                        </span>
                                        <span
                                            style={{
                                                position: "absolute",
                                                right: "12px",
                                                top: "50%",
                                                transform: `translateY(-50%) ${yearDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
                                                color: "#05c7ee",
                                                fontSize: "11px",
                                                transition: "transform 0.2s ease",
                                                pointerEvents: "none"
                                            }}
                                        >
                                            ▼
                                        </span>
                                    </button>

                                    {yearDropdownOpen && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "calc(100% + 4px)",
                                                left: 0,
                                                right: 0,
                                                background: "#171c22",
                                                border: "1px solid #3c494e",
                                                borderRadius: "8px",
                                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.75)",
                                                maxHeight: "220px",
                                                overflowY: "auto",
                                                zIndex: 9999,
                                                padding: "4px 0"
                                            }}
                                        >
                                            {[
                                                { val: 1, label: "1st Year" },
                                                { val: 2, label: "2nd Year" },
                                                { val: 3, label: "3rd Year" },
                                                { val: 4, label: "4th Year" }
                                            ].map((y) => {
                                                const isSelected = Number(year) === y.val;
                                                return (
                                                    <div
                                                        key={y.val}
                                                        onClick={() => {
                                                            setYear(y.val);
                                                            setYearDropdownOpen(false);
                                                        }}
                                                        style={{
                                                            padding: "10px 14px",
                                                            fontSize: "13px",
                                                            color: isSelected ? "#05c7ee" : "#e2e8f0",
                                                            background: isSelected ? "rgba(5, 199, 238, 0.12)" : "transparent",
                                                            fontWeight: isSelected ? 700 : 500,
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            transition: "background 0.15s ease, color 0.15s ease"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isSelected) {
                                                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                                                e.currentTarget.style.color = "#ffffff";
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = isSelected ? "rgba(5, 199, 238, 0.12)" : "transparent";
                                                            e.currentTarget.style.color = isSelected ? "#05c7ee" : "#e2e8f0";
                                                        }}
                                                    >
                                                        <span>{y.label}</span>
                                                        {isSelected && <span style={{ color: "#05c7ee", fontWeight: "bold" }}>✓</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="field">
                            <label htmlFor="password">Password *</label>
                            <div className="field-input">
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