import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin.css";

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview"); // overview, matches, tournaments, equipment, activities

    // Request Equipment Modal
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
    const [requestQuantity, setRequestQuantity] = useState(1);
    const [requestDueDate, setRequestDueDate] = useState("");
    const [requestRemarks, setRequestRemarks] = useState("");
    const [submittingRequest, setSubmittingRequest] = useState(false);
    const [requestSuccessMsg, setRequestSuccessMsg] = useState("");
    const [requestErrorMsg, setRequestErrorMsg] = useState("");

    const token = localStorage.getItem("token");
    const apiHost = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
    const API_BASE = `http://${apiHost}:5000/api`;

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get(`${API_BASE}/student/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.success) {
                setDashboardData(res.data.data);
            }
        } catch (err) {
            console.error("Student dashboard error:", err);
            setError(
                err.response?.data?.message || "Unable to load student athlete dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchEquipmentCatalog = async () => {
        try {
            const res = await axios.get(`${API_BASE}/student/equipment`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.success && res.data.equipment.length > 0) {
                setAvailableEquipment(res.data.equipment);
                setSelectedEquipmentId(res.data.equipment[0]._id);
            }
        } catch (err) {
            console.warn("Could not load equipment catalog:", err.message);
        }
    };

    useEffect(() => {
        fetchDashboard();
        fetchEquipmentCatalog();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleEquipmentRequestSubmit = async (e) => {
        e.preventDefault();
        setRequestErrorMsg("");
        setRequestSuccessMsg("");
        setSubmittingRequest(true);

        try {
            const res = await axios.post(
                `${API_BASE}/student/equipment-request`,
                {
                    equipmentId: selectedEquipmentId,
                    quantity: Number(requestQuantity),
                    dueDate: requestDueDate,
                    remarks: requestRemarks
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setRequestSuccessMsg(res.data.message || "Equipment request submitted successfully!");
            setRequestRemarks("");
            setRequestQuantity(1);

            // Refresh dashboard data
            fetchDashboard();

            setTimeout(() => {
                setShowRequestModal(false);
                setRequestSuccessMsg("");
            }, 1800);
        } catch (err) {
            console.error("Equipment request error:", err);
            setRequestErrorMsg(
                err.response?.data?.message || "Failed to submit equipment request. Please try again."
            );
        } finally {
            setSubmittingRequest(false);
        }
    };

    const student = dashboardData?.student || {
        name: user?.name || "Student Athlete",
        studentId: user?.userId || "STUDENT",
        email: user?.email || "",
        department: "General",
        year: 1,
        registerNumber: "-"
    };
    const coach = dashboardData?.coach;
    const team = dashboardData?.team;
    const sport = dashboardData?.sport || coach?.sport || "Athletics";
    const stats = dashboardData?.stats || {
        equipmentIssuedCount: 0,
        pendingRequestsCount: 0,
        upcomingMatchesCount: 0,
        tournamentsCount: 0
    };
    const issuedEquipment = dashboardData?.issuedEquipment || [];
    const equipmentRequests = dashboardData?.equipmentRequests || [];
    const tournaments = dashboardData?.tournaments || [];
    const schedules = dashboardData?.schedules || [];
    const activities = dashboardData?.activities || [];

    return (
        <div style={{ minHeight: "100vh", background: "#0c1015", color: "#e5e7eb", fontFamily: "Segoe UI, Arial, sans-serif" }}>
            {/* TOP NAVIGATION BAR */}
            <header
                style={{
                    height: "64px",
                    borderBottom: "1px solid #1f2732",
                    background: "#141a22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 28px",
                    position: "sticky",
                    top: 0,
                    zIndex: 50
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #05c7ee 0%, #0088aa 100%)",
                            color: "#07131a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            fontWeight: 900,
                            boxShadow: "0 0 15px rgba(5, 199, 238, 0.4)"
                        }}
                    >
                        🏟️
                    </div>
                    <div>
                        <strong style={{ color: "#05c7ee", fontSize: "16px", letterSpacing: "0.5px" }}>BIT SPORTS COUNCIL</strong>
                        <span style={{ display: "block", fontSize: "9px", color: "#8da3b5", letterSpacing: "1px", fontWeight: 700 }}>STUDENT ATHLETE PORTAL</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ textAlign: "right" }}>
                        <strong style={{ display: "block", fontSize: "13px", color: "#ffffff" }}>{student.name}</strong>
                        <span style={{ fontSize: "10px", color: "#35d49b", fontWeight: 700 }}>
                            ● Active Athlete ({student.studentId})
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "7px 14px",
                            background: "#1c222b",
                            color: "#ef8585",
                            border: "1px solid #3b2326",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* MAIN PORTAL BODY */}
            <main style={{ maxWidth: "1160px", margin: "0 auto", padding: "28px 20px 60px" }}>
                {/* HERO ATHLETE WELCOME BANNER */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #152731 0%, #151d26 100%)",
                        border: "1px solid #234552",
                        borderRadius: "12px",
                        padding: "26px 30px",
                        marginBottom: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "20px",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)"
                    }}
                >
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "#0c3329", color: "#35d49b", borderRadius: "20px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", marginBottom: "10px", border: "1px solid #1a5243" }}>
                            <span>✓</span> Verified Student Athlete
                        </div>
                        <h1 style={{ fontSize: "26px", color: "#ffffff", margin: "0 0 8px", fontWeight: 800 }}>
                            Welcome, {student.name}!
                        </h1>
                        <p style={{ fontSize: "13px", color: "#9da9b4", margin: 0, display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                            <span>🆔 <strong>Roll No:</strong> {student.registerNumber}</span>
                            <span>🏛️ <strong>Dept:</strong> {student.department}</span>
                            <span>🎓 <strong>Year:</strong> Year {student.year}</span>
                            <span>🏅 <strong>Sport:</strong> <span style={{ color: "#05c7ee", fontWeight: 700 }}>{sport}</span></span>
                            <span>🏆 <strong>Team Squad:</strong> <span style={{ color: "#35d49b", fontWeight: 700 }}>{team?.name || coach?.teamName || `${sport} Squad`}</span></span>
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={() => setShowRequestModal(true)}
                            style={{
                                padding: "10px 18px",
                                background: "#05c7ee",
                                color: "#07131a",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                boxShadow: "0 0 15px rgba(5, 199, 238, 0.4)"
                            }}
                        >
                            <span>📦</span> Request Equipment
                        </button>
                    </div>
                </div>

                {/* ERROR NOTIFICATION */}
                {error && (
                    <div className="error" style={{ marginBottom: "20px" }}>
                        {error}
                    </div>
                )}

                {/* 4 PRIMARY METRIC CARDS */}
                <div className="stats-grid" style={{ marginBottom: "24px" }}>
                    {/* ASSIGNED SPORT & COACH */}
                    <div className="stat-card" style={{ borderLeft: "4px solid #05c7ee" }}>
                        <div className="stat-header">
                            <span>PRIMARY SPORT</span>
                            <div className="stat-icon">🏅</div>
                        </div>
                        <h2 style={{ fontSize: "20px", color: "#05c7ee" }}>{sport}</h2>
                        <p>Coach: <strong>{coach?.name || "Sports Coach"}</strong></p>
                    </div>

                    {/* SQUAD / TEAM */}
                    <div className="stat-card" style={{ borderLeft: "4px solid #35d49b" }}>
                        <div className="stat-header">
                            <span>TEAM / SQUAD</span>
                            <div className="stat-icon">👥</div>
                        </div>
                        <h2 style={{ fontSize: "20px", color: "#35d49b" }}>
                            {team?.name || `${sport} Squad`}
                        </h2>
                        <p>{team?.memberCount || 1} Athletes in Squad</p>
                    </div>

                    {/* UPCOMING MATCHES */}
                    <div className="stat-card" style={{ borderLeft: "4px solid #e8a91b" }}>
                        <div className="stat-header">
                            <span>UPCOMING FIXTURES</span>
                            <div className="stat-icon">📅</div>
                        </div>
                        <h2 style={{ fontSize: "20px", color: "#e8a91b" }}>{stats.upcomingMatchesCount}</h2>
                        <p>Matches & Training Sessions</p>
                    </div>

                    {/* ISSUED GEAR */}
                    <div className="stat-card" style={{ borderLeft: "4px solid #9b6cf5" }}>
                        <div className="stat-header">
                            <span>EQUIPMENT IN HAND</span>
                            <div className="stat-icon">📦</div>
                        </div>
                        <h2 style={{ fontSize: "20px", color: "#b794f6" }}>{stats.equipmentIssuedCount}</h2>
                        <p>{stats.pendingRequestsCount} Requests Pending</p>
                    </div>
                </div>

                {/* NAVIGATION TABS */}
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        background: "#141920",
                        padding: "6px",
                        borderRadius: "10px",
                        border: "1px solid #232c37",
                        marginBottom: "24px",
                        overflowX: "auto"
                    }}
                >
                    <button
                        onClick={() => setActiveTab("overview")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: activeTab === "overview" ? "#05c7ee" : "transparent",
                            color: activeTab === "overview" ? "#07131a" : "#9da9b4",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                        }}
                    >
                        🪪 Profile & Squad
                    </button>

                    <button
                        onClick={() => setActiveTab("matches")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: activeTab === "matches" ? "#05c7ee" : "transparent",
                            color: activeTab === "matches" ? "#07131a" : "#9da9b4",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                        }}
                    >
                        📅 Upcoming Matches ({schedules.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("tournaments")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: activeTab === "tournaments" ? "#05c7ee" : "transparent",
                            color: activeTab === "tournaments" ? "#07131a" : "#9da9b4",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                        }}
                    >
                        🏆 Tournaments ({tournaments.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("equipment")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: activeTab === "equipment" ? "#05c7ee" : "transparent",
                            color: activeTab === "equipment" ? "#07131a" : "#9da9b4",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                        }}
                    >
                        📦 Equipment & Requests ({equipmentRequests.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("activities")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: activeTab === "activities" ? "#05c7ee" : "transparent",
                            color: activeTab === "activities" ? "#07131a" : "#9da9b4",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                        }}
                    >
                        ⚡ Recent Activities
                    </button>
                </div>

                {/* TAB CONTENT */}
                {loading ? (
                    <div className="empty-state" style={{ padding: "40px 20px" }}>
                        <div className="stat-icon" style={{ marginBottom: "12px" }}>⏳</div>
                        <h3>Loading your athlete dashboard...</h3>
                    </div>
                ) : (
                    <div>
                        {/* TAB 1: OVERVIEW (PROFILE, COACH & TEAM) */}
                        {activeTab === "overview" && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                                {/* ATHLETE PROFILE CARD */}
                                <div className="management-card">
                                    <div className="management-card-header">
                                        <h2>Athlete Profile Details</h2>
                                        <span className="status-badge success">Approved</span>
                                    </div>
                                    <div className="management-card-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #232c37", paddingBottom: "8px" }}>
                                            <span style={{ color: "#8da3b5", fontSize: "12px" }}>Full Name:</span>
                                            <strong style={{ color: "#e7edf2", fontSize: "13px" }}>{student.name}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #232c37", paddingBottom: "8px" }}>
                                            <span style={{ color: "#8da3b5", fontSize: "12px" }}>Student Athlete ID:</span>
                                            <strong style={{ color: "#05c7ee", fontSize: "13px" }}>{student.studentId}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #232c37", paddingBottom: "8px" }}>
                                            <span style={{ color: "#8da3b5", fontSize: "12px" }}>Roll / Register Number:</span>
                                            <strong style={{ color: "#e7edf2", fontSize: "13px" }}>{student.registerNumber}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #232c37", paddingBottom: "8px" }}>
                                            <span style={{ color: "#8da3b5", fontSize: "12px" }}>Institutional Email:</span>
                                            <span style={{ color: "#35d49b", fontSize: "12px" }}>{student.email} ✓</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #232c37", paddingBottom: "8px" }}>
                                            <span style={{ color: "#8da3b5", fontSize: "12px" }}>Mobile Contact:</span>
                                            <span style={{ color: "#e7edf2", fontSize: "12px" }}>+91 {student.phone || "Not set"}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #232c37", paddingBottom: "8px" }}>
                                            <span style={{ color: "#8da3b5", fontSize: "12px" }}>Assigned Team / Squad:</span>
                                            <strong style={{ color: "#35d49b", fontSize: "13px" }}>{team?.name || coach?.teamName || `${sport} Team`}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#8da3b5", fontSize: "12px" }}>Department & Year:</span>
                                            <span style={{ color: "#e7edf2", fontSize: "12px" }}>{student.department} (Year {student.year})</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ASSIGNED COACH CARD */}
                                <div className="management-card">
                                    <div className="management-card-header">
                                        <h2>Assigned Sports Coach</h2>
                                        <span className="status-badge processing">{sport}</span>
                                    </div>
                                    <div className="management-card-body">
                                        {coach ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                                                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#172d35", color: "#05c7ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800 }}>
                                                        🏅
                                                    </div>
                                                    <div>
                                                        <strong style={{ color: "#ffffff", fontSize: "15px", display: "block" }}>{coach.name}</strong>
                                                        <span style={{ fontSize: "11px", color: "#05c7ee" }}>Coach ID: {coach.userId}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #232c37", paddingBottom: "8px" }}>
                                                    <span style={{ color: "#8da3b5", fontSize: "12px" }}>Assigned Squad / Team:</span>
                                                    <strong style={{ color: "#35d49b", fontSize: "13px" }}>{coach.teamName || team?.name || `${coach.sport || sport} Team`}</strong>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #232c37", paddingBottom: "8px" }}>
                                                    <span style={{ color: "#8da3b5", fontSize: "12px" }}>Specialized Sport:</span>
                                                    <strong style={{ color: "#e7edf2", fontSize: "13px" }}>{coach.sport || sport}</strong>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #232c37", paddingBottom: "8px" }}>
                                                    <span style={{ color: "#8da3b5", fontSize: "12px" }}>Coach Email:</span>
                                                    <span style={{ color: "#e7edf2", fontSize: "12px" }}>{coach.email}</span>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <span style={{ color: "#8da3b5", fontSize: "12px" }}>Contact Number:</span>
                                                    <span style={{ color: "#35d49b", fontSize: "12px" }}>{coach.phone || "Available in portal"}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ color: "#8da3b5", fontSize: "13px" }}>Coach is assigned to {sport} coaching staff.</p>
                                        )}
                                    </div>
                                </div>

                                {/* TEAM / SQUAD ROSTER CARD */}
                                <div className="management-card" style={{ gridColumn: "1 / -1" }}>
                                    <div className="management-card-header">
                                        <h2>Team Squad & Roster</h2>
                                        <span style={{ fontSize: "11px", color: "#05c7ee", fontWeight: 700 }}>
                                            {team?.name || `${sport} Varsity Team`}
                                        </span>
                                    </div>
                                    <div className="management-card-body">
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                                            <div>
                                                <strong style={{ fontSize: "15px", color: "#ffffff", display: "block" }}>
                                                    {team?.name || `BIT ${sport} Team`}
                                                </strong>
                                                <span style={{ fontSize: "12px", color: "#8da3b5" }}>
                                                    Representing Bannari Amman Institute of Technology in Inter-College Tournaments.
                                                </span>
                                            </div>
                                            <span className="status-badge success">Active Squad Member</span>
                                        </div>

                                        {team?.members && team.members.length > 0 ? (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                                                {team.members.map((m, idx) => (
                                                    <div key={m._id || idx} style={{ padding: "10px 12px", background: "#171c22", borderRadius: "6px", border: "1px solid #272f3a", display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#213642", color: "#05c7ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>
                                                            {m.name ? m.name.charAt(0) : "A"}
                                                        </div>
                                                        <div>
                                                            <strong style={{ fontSize: "12px", color: "#e7edf2", display: "block" }}>{m.name}</strong>
                                                            <span style={{ fontSize: "10px", color: "#8da3b5" }}>{m.studentId || m.department || "Athlete"}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ padding: "14px", background: "#171c22", borderRadius: "6px", border: "1px solid #272f3a", color: "#9da9b4", fontSize: "12px" }}>
                                                You are registered as an athlete under Coach {coach?.name || "Sports Coach"}. Squad fixtures and entries will appear here.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: UPCOMING MATCHES & SCHEDULES */}
                        {activeTab === "matches" && (
                            <div className="management-card">
                                <div className="management-card-header">
                                    <h2>Upcoming Matches & Training Sessions</h2>
                                    <span style={{ fontSize: "11px", color: "#05c7ee", fontWeight: 700 }}>{schedules.length} Fixtures</span>
                                </div>
                                <div className="management-card-body">
                                    {schedules.length === 0 ? (
                                        <div className="empty-state">
                                            <div style={{ fontSize: "36px", marginBottom: "10px" }}>📅</div>
                                            <h3>No Upcoming Matches Scheduled</h3>
                                            <p>Your coach will schedule match fixtures and practice sessions. Check back soon.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                                            {schedules.map((match, idx) => (
                                                <div
                                                    key={match._id || idx}
                                                    style={{
                                                        background: "#171c22",
                                                        border: "1px solid #272f3a",
                                                        borderRadius: "8px",
                                                        padding: "16px",
                                                        position: "relative"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                                        <div>
                                                            <strong style={{ fontSize: "15px", color: "#ffffff", display: "block" }}>
                                                                {match.title || `${sport} Match`}
                                                            </strong>
                                                            <span style={{ fontSize: "11px", color: "#05c7ee", fontWeight: 700 }}>
                                                                vs {match.opponent || match.opponentTeam || "Visiting Team"}
                                                            </span>
                                                        </div>
                                                        <span className="status-badge warning">{match.status || "Upcoming"}</span>
                                                    </div>

                                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "#9da9b4", borderTop: "1px solid #232c37", paddingTop: "10px" }}>
                                                        <div>📅 <strong>Date:</strong> {match.date ? new Date(match.date).toLocaleDateString() : "TBA"} {match.time ? `at ${match.time}` : ""}</div>
                                                        <div>🏟️ <strong>Venue:</strong> {match.venue || "BIT Main Ground"}</div>
                                                        <div>🏅 <strong>Sport:</strong> {match.sport || sport}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: UPCOMING TOURNAMENTS */}
                        {activeTab === "tournaments" && (
                            <div className="management-card">
                                <div className="management-card-header">
                                    <h2>Upcoming & Ongoing Tournaments</h2>
                                    <span style={{ fontSize: "11px", color: "#05c7ee", fontWeight: 700 }}>{tournaments.length} Tournaments</span>
                                </div>
                                <div className="management-card-body">
                                    {tournaments.length === 0 ? (
                                        <div className="empty-state">
                                            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏆</div>
                                            <h3>No Tournaments Listed</h3>
                                            <p>Inter-college and state tournaments will appear here when announced by the Sports Council.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                                            {tournaments.map((tour, idx) => (
                                                <div
                                                    key={tour._id || idx}
                                                    style={{
                                                        background: "#171c22",
                                                        border: "1px solid #272f3a",
                                                        borderRadius: "8px",
                                                        padding: "16px"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                                        <div>
                                                            <strong style={{ fontSize: "15px", color: "#ffffff", display: "block" }}>
                                                                {tour.name}
                                                            </strong>
                                                            <span style={{ fontSize: "11px", color: "#05c7ee" }}>
                                                                Sport: {tour.sport || sport}
                                                            </span>
                                                        </div>
                                                        <span className="status-badge success">{tour.status || "Upcoming"}</span>
                                                    </div>

                                                    <p style={{ fontSize: "12px", color: "#9da9b4", margin: "0 0 10px", lineHeight: "1.4" }}>
                                                        {tour.description || "State-level tournament representing BIT Sports Council."}
                                                    </p>

                                                    <div style={{ fontSize: "11px", color: "#8da3b5", borderTop: "1px solid #232c37", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
                                                        <span>Start: {tour.startDate ? new Date(tour.startDate).toLocaleDateString() : "TBA"}</span>
                                                        <span>End: {tour.endDate ? new Date(tour.endDate).toLocaleDateString() : "TBA"}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 4: EQUIPMENT ISSUED & REQUESTS */}
                        {activeTab === "equipment" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {/* ISSUED GEAR SECTION */}
                                <div className="management-card">
                                    <div className="management-card-header">
                                        <h2>Equipment Currently Issued to You</h2>
                                        <button
                                            onClick={() => setShowRequestModal(true)}
                                            style={{
                                                padding: "6px 14px",
                                                background: "#05c7ee",
                                                color: "#07131a",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: 800,
                                                cursor: "pointer"
                                            }}
                                        >
                                            + Request New Gear
                                        </button>
                                    </div>
                                    <div className="management-card-body">
                                        {issuedEquipment.length === 0 ? (
                                            <div style={{ padding: "20px", textAlign: "center", color: "#8da3b5", fontSize: "13px" }}>
                                                No equipment currently in your possession. Click <strong>Request New Gear</strong> to submit an equipment requisition.
                                            </div>
                                        ) : (
                                            <div className="admin-table-wrapper">
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr>
                                                            <th>EQUIPMENT ITEM</th>
                                                            <th>CATEGORY</th>
                                                            <th>QUANTITY</th>
                                                            <th>REQUEST DATE</th>
                                                            <th>DUE DATE</th>
                                                            <th>STATUS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {issuedEquipment.map((item) => (
                                                            <tr key={item._id}>
                                                                <td>
                                                                    <strong style={{ color: "#ffffff" }}>
                                                                        {item.equipmentId?.name || "Sports Gear"}
                                                                    </strong>
                                                                </td>
                                                                <td>{item.equipmentId?.category || "Equipment"}</td>
                                                                <td><strong style={{ color: "#05c7ee" }}>{item.quantity} units</strong></td>
                                                                <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}</td>
                                                                <td>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "7 Days"}</td>
                                                                <td><span className="status-badge success">Issued / In Hand</span></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ALL EQUIPMENT REQUESTS HISTORY */}
                                <div className="management-card">
                                    <div className="management-card-header">
                                        <h2>Equipment Requisition History</h2>
                                        <span style={{ fontSize: "11px", color: "#05c7ee", fontWeight: 700 }}>
                                            {equipmentRequests.length} Total Requests
                                        </span>
                                    </div>
                                    <div className="management-card-body">
                                        {equipmentRequests.length === 0 ? (
                                            <div style={{ padding: "20px", textAlign: "center", color: "#8da3b5", fontSize: "13px" }}>
                                                You haven't submitted any equipment requests yet.
                                            </div>
                                        ) : (
                                            <div className="admin-table-wrapper">
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr>
                                                            <th>REQUEST ID</th>
                                                            <th>EQUIPMENT</th>
                                                            <th>QTY</th>
                                                            <th>DATE SUBMITTED</th>
                                                            <th>REMARKS</th>
                                                            <th>APPROVAL STATUS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {equipmentRequests.map((req) => (
                                                            <tr key={req._id}>
                                                                <td><span style={{ color: "#05c7ee", fontWeight: 700 }}>{req.requestId}</span></td>
                                                                <td><strong>{req.equipmentId?.name || "Equipment"}</strong></td>
                                                                <td>{req.quantity}</td>
                                                                <td>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}</td>
                                                                <td style={{ fontSize: "11px", color: "#9da9b4" }}>{req.remarks || "-"}</td>
                                                                <td>
                                                                    {req.status === "approved" ? (
                                                                        <span className="status-badge success">Approved</span>
                                                                    ) : req.status === "pending" ? (
                                                                        <span className="status-badge warning">Pending</span>
                                                                    ) : req.status === "rejected" ? (
                                                                        <span className="status-badge danger">Rejected</span>
                                                                    ) : (
                                                                        <span className="status-badge processing">{req.status}</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 5: RECENT ACTIVITIES */}
                        {activeTab === "activities" && (
                            <div className="management-card">
                                <div className="management-card-header">
                                    <h2>Athlete Activity & Announcement Feed</h2>
                                    <span style={{ fontSize: "11px", color: "#05c7ee", fontWeight: 700 }}>Real-time</span>
                                </div>
                                <div className="management-card-body">
                                    {activities.length === 0 ? (
                                        <div className="empty-state">
                                            <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚡</div>
                                            <h3>No Recent Activities Recorded</h3>
                                            <p>Updates on squad assignments, matches, and equipment will show here.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            {activities.map((act, idx) => (
                                                <div
                                                    key={act._id || idx}
                                                    style={{
                                                        padding: "14px 16px",
                                                        background: "#171c22",
                                                        borderRadius: "8px",
                                                        border: "1px solid #272f3a",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        gap: "12px"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#172d35", color: "#05c7ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                                                            📢
                                                        </div>
                                                        <div>
                                                            <strong style={{ fontSize: "13px", color: "#ffffff", display: "block" }}>
                                                                {act.type || "Update"}
                                                            </strong>
                                                            <span style={{ fontSize: "12px", color: "#9da9b4" }}>
                                                                {act.message}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span style={{ fontSize: "11px", color: "#8da3b5", whiteSpace: "nowrap" }}>
                                                        {act.createdAt ? new Date(act.createdAt).toLocaleDateString() : ""}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* REQUEST EQUIPMENT MODAL */}
            {showRequestModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        padding: "20px"
                    }}
                >
                    <div
                        className="glass-panel"
                        style={{
                            width: "100%",
                            maxWidth: "480px",
                            padding: "28px",
                            borderRadius: "12px",
                            background: "#161c24",
                            border: "1px solid #2d3846",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                            <h2 style={{ fontSize: "18px", color: "#ffffff", margin: 0 }}>Request Sports Equipment</h2>
                            <button
                                onClick={() => setShowRequestModal(false)}
                                style={{ background: "none", border: "none", color: "#8da3b5", fontSize: "18px", cursor: "pointer" }}
                            >
                                ✕
                            </button>
                        </div>

                        {requestSuccessMsg && (
                            <div style={{ background: "#0c3329", color: "#35d49b", border: "1px solid #35d49b", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>
                                {requestSuccessMsg}
                            </div>
                        )}

                        {requestErrorMsg && (
                            <div style={{ background: "#3b1f21", color: "#ef8585", border: "1px solid #ef8585", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>
                                {requestErrorMsg}
                            </div>
                        )}

                        <form onSubmit={handleEquipmentRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div className="field">
                                <label>Select Equipment Item *</label>
                                <select
                                    value={selectedEquipmentId}
                                    onChange={(e) => setSelectedEquipmentId(e.target.value)}
                                    style={{
                                        width: "100%",
                                        background: "#10141a",
                                        border: "1px solid #3c494e",
                                        borderRadius: "6px",
                                        padding: "10px",
                                        color: "#fff",
                                        fontSize: "14px",
                                        outline: "none"
                                    }}
                                    required
                                >
                                    {availableEquipment.map((eq) => (
                                        <option key={eq._id} value={eq._id} style={{ background: "#171c22", color: "#fff" }}>
                                            {eq.name} ({eq.sport}) — {eq.availableQuantity} available
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div className="field">
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={requestQuantity}
                                        onChange={(e) => setRequestQuantity(e.target.value)}
                                        style={{
                                            width: "100%",
                                            background: "#10141a",
                                            border: "1px solid #3c494e",
                                            borderRadius: "6px",
                                            padding: "10px",
                                            color: "#fff",
                                            fontSize: "14px"
                                        }}
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label>Expected Due Date</label>
                                    <input
                                        type="date"
                                        value={requestDueDate}
                                        onChange={(e) => setRequestDueDate(e.target.value)}
                                        style={{
                                            width: "100%",
                                            background: "#10141a",
                                            border: "1px solid #3c494e",
                                            borderRadius: "6px",
                                            padding: "10px",
                                            color: "#fff",
                                            fontSize: "14px"
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label>Purpose / Remarks</label>
                                <textarea
                                    placeholder="e.g. Practice session for upcoming tournament"
                                    value={requestRemarks}
                                    onChange={(e) => setRequestRemarks(e.target.value)}
                                    rows="3"
                                    style={{
                                        width: "100%",
                                        background: "#10141a",
                                        border: "1px solid #3c494e",
                                        borderRadius: "6px",
                                        padding: "10px",
                                        color: "#fff",
                                        fontSize: "13px",
                                        resize: "none"
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowRequestModal(false)}
                                    style={{
                                        padding: "9px 16px",
                                        background: "transparent",
                                        color: "#8da3b5",
                                        border: "1px solid #3c494e",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingRequest}
                                    style={{
                                        padding: "9px 18px",
                                        background: "#05c7ee",
                                        color: "#07131a",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: 800,
                                        cursor: submittingRequest ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {submittingRequest ? "Submitting..." : "Submit Requisition"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;