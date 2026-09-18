import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { RotateCcw, Package, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

import "./CoachDashboard.css";

const CoachDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/coach/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDashboard(response.data);

        } catch (err) {

            console.error("Coach dashboard error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load coach dashboard"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);


    if (loading) {
        return (
            <div className="coach-dashboard-loading">
                Loading dashboard...
            </div>
        );
    }


    if (error) {
        return (
            <div className="coach-dashboard-error">

                <h2>Unable to load dashboard</h2>

                <p>{error}</p>

                <button onClick={loadDashboard}>
                    Try Again
                </button>

            </div>
        );
    }


    return (
        <div className="coach-dashboard">

            {/* =========================
                CONTENT
            ========================= */}

            <div className="coach-content">

                {/* PAGE HEADER */}

                <div className="coach-page-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>

                    <div>

                        <h1>
                            Coach Dashboard
                        </h1>

                        <p>
                            Manage your team, players, equipment, athlete loans and returns.
                        </p>

                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={() => navigate("/coach/equipment")}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                backgroundColor: "#05c7ee",
                                color: "#07131a",
                                fontWeight: "700",
                                padding: "10px 18px",
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "13px"
                            }}
                        >
                            <RotateCcw size={16} />
                            RETURN EQUIPMENT
                        </button>
                    </div>

                </div>


                {/* =========================
                    STAT CARDS
                ========================= */}

                <div className="coach-stats-grid">


                    {/* TEAM */}

                    <div className="coach-stat-card" onClick={() => navigate("/coach/team")} style={{ cursor: "pointer" }}>

                        <div className="coach-stat-header">

                            <span>
                                MY TEAM
                            </span>

                            <div className="coach-stat-icon">
                                🏆
                            </div>

                        </div>

                        <h2>
                            {dashboard?.stats?.teams || 0}
                        </h2>

                        <p>
                            Assigned squad
                        </p>

                    </div>


                    {/* STUDENTS */}

                    <div className="coach-stat-card" onClick={() => navigate("/coach/students")} style={{ cursor: "pointer" }}>

                        <div className="coach-stat-header">

                            <span>
                                PLAYERS
                            </span>

                            <div className="coach-stat-icon">
                                👥
                            </div>

                        </div>

                        <h2>
                            {dashboard?.stats?.students || 0}
                        </h2>

                        <p>
                            Registered players
                        </p>

                    </div>


                    {/* EQUIPMENT */}

                    <div className="coach-stat-card" onClick={() => navigate("/coach/equipment")} style={{ cursor: "pointer" }}>

                        <div className="coach-stat-header">

                            <span>
                                EQUIPMENT
                            </span>

                            <div className="coach-stat-icon">
                                ⚽
                            </div>

                        </div>

                        <h2>
                            {dashboard?.stats?.equipment || 0}
                        </h2>

                        <p>
                            Available inventory items
                        </p>

                    </div>


                    {/* ACTIVE LOANS & RETURNS */}

                    <div className="coach-stat-card highlight-coach-card" onClick={() => navigate("/coach/equipment")} style={{ cursor: "pointer" }}>

                        <div className="coach-stat-header">

                            <span>
                                ACTIVE LOANS & RETURNS
                            </span>

                            <div className="coach-stat-icon" style={{ backgroundColor: "rgba(5, 199, 238, 0.2)", color: "#05c7ee" }}>
                                🔄
                            </div>

                        </div>

                        <h2>
                            {dashboard?.stats?.activeLoans || 0}
                        </h2>

                        <p style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Active loans</span>
                            <span style={{ color: "#38bdf8", fontWeight: "700" }}>{dashboard?.stats?.returnedLoans || 0} returned</span>
                        </p>

                    </div>


                </div>


                {/* =========================
                    LOWER GRID
                ========================= */}

                <div className="coach-dashboard-grid">


                    {/* =========================
                        MY TEAM
                    ========================= */}

                    <div className="coach-panel">

                        <div className="coach-panel-header">

                            <div className="coach-panel-title">

                                <span>
                                    🏆
                                </span>

                                <h3>
                                    My Team
                                </h3>

                            </div>

                        </div>


                        <div className="coach-team-content">

                            {dashboard?.team ? (

                                <>

                                    <div className="coach-team-name">

                                        <h2>
                                            {dashboard.team.name}
                                        </h2>

                                        <span className="coach-team-status">
                                            {dashboard.team.status || "Active"}
                                        </span>

                                    </div>


                                    <div className="coach-team-details">

                                        <div>
                                            <span>SPORT</span>

                                            <strong>
                                                {dashboard.team.sport || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>PLAYERS</span>

                                            <strong>
                                                {dashboard.stats?.students || 0}
                                            </strong>
                                        </div>

                                    </div>

                                </>

                            ) : (

                                <div className="coach-empty">

                                    <h3>
                                        No team assigned
                                    </h3>

                                    <p>
                                        Your team information will appear here
                                        once a team is assigned.
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =========================
                        UPCOMING MATCHES
                    ========================= */}

                    <div className="coach-panel">

                        <div className="coach-panel-header">

                            <div className="coach-panel-title">

                                <span>
                                    📅
                                </span>

                                <h3>
                                    Upcoming Matches
                                </h3>

                            </div>

                        </div>


                        <div className="coach-match-list">

                            {dashboard?.matches?.length === 0 ? (

                                <div className="coach-empty">

                                    <h3>
                                        No upcoming matches
                                    </h3>

                                    <p>
                                        Scheduled matches will appear here.
                                    </p>

                                </div>

                            ) : (

                                dashboard?.matches?.map((match) => (

                                    <div
                                        className="coach-match-item"
                                        key={match._id}
                                    >

                                        <div className="match-date">

                                            {match.date
                                                ? new Date(match.date)
                                                    .toLocaleDateString()
                                                : "-"
                                            }

                                        </div>


                                        <div className="match-info">

                                            <h4>
                                                {match.opponent ||
                                                    match.opponentTeam ||
                                                    "Opponent"}
                                            </h4>

                                            <p>
                                                {match.venue || "Venue not assigned"}
                                            </p>

                                        </div>


                                        <strong>
                                            {match.time || "-"}
                                        </strong>

                                    </div>

                                ))

                            )}

                        </div>

                    </div>


                    {/* =========================
                        RECENT ACTIVITIES
                    ========================= */}

                    <div className="coach-panel">

                        <div className="coach-panel-header">

                            <div className="coach-panel-title">

                                <span>
                                    ⚡
                                </span>

                                <h3>
                                    Recent Activities
                                </h3>

                            </div>

                        </div>


                        <div className="coach-activity-list">

                            {dashboard?.activities?.length === 0 ? (

                                <div className="coach-empty">

                                    <h3>
                                        No activities yet
                                    </h3>

                                    <p>
                                        Recent team activities will appear here.
                                    </p>

                                </div>

                            ) : (

                                dashboard?.activities?.map((activity) => (

                                    <div
                                        className="coach-activity-item"
                                        key={activity._id}
                                    >

                                        <div className="activity-dot"></div>

                                        <div>

                                            <h4>
                                                {activity.action}
                                            </h4>

                                            <p>
                                                {activity.createdAt
                                                    ? new Date(
                                                        activity.createdAt
                                                    ).toLocaleString()
                                                    : "-"
                                                }
                                            </p>

                                        </div>

                                    </div>

                                ))

                            )}

                        </div>

                    </div>


                    {/* =========================
                        EQUIPMENT REQUESTS & ACTIVE LOANS
                    ========================= */}

                    <div className="coach-panel">

                        <div className="coach-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                            <div className="coach-panel-title">

                                <span>
                                    📦
                                </span>

                                <h3>
                                    Equipment & Loans
                                </h3>

                            </div>

                            <button
                                onClick={() => navigate("/coach/equipment")}
                                style={{
                                    backgroundColor: "transparent",
                                    border: "none",
                                    color: "#05c7ee",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}
                            >
                                Manage / Return Gear <ArrowRight size={14} />
                            </button>

                        </div>


                        <div className="coach-request-list">

                            {dashboard?.requests?.length === 0 ? (

                                <div className="coach-empty">

                                    <h3>
                                        No equipment records
                                    </h3>

                                    <p>
                                        Your equipment requests and athlete loans will appear here.
                                    </p>

                                </div>

                            ) : (

                                dashboard?.requests?.map((request) => {
                                    const isApproved = request.status === "approved";
                                    const isReturned = request.status === "returned";
                                    const isDamaged = request.returnCondition === "damaged" || (request.damagedQuantityReturned && request.damagedQuantityReturned > 0);

                                    return (
                                        <div
                                            className="coach-request-item"
                                            key={request._id}
                                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" }}
                                        >

                                            <div>

                                                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#f0f6fc" }}>
                                                    {request.equipment?.name ||
                                                        request.equipmentName ||
                                                        "Equipment"}
                                                </h4>

                                                <p style={{ margin: 0, fontSize: "12px", color: "#8da3b5" }}>
                                                    Qty: <strong style={{ color: "#f0f6fc" }}>{request.quantity || 1}</strong>
                                                    {request.studentId?.name && ` • Holder: ${request.studentId.name}`}
                                                </p>

                                                {isReturned && (
                                                    <span style={{ fontSize: "11px", color: isDamaged ? "#f87171" : "#4ade80", marginTop: "4px", display: "block" }}>
                                                        {isDamaged
                                                            ? `⚠️ Returned damaged (${request.damagedQuantityReturned || request.quantity} units)`
                                                            : "✓ Returned in good condition"}
                                                    </span>
                                                )}

                                            </div>

                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                                                <span
                                                    className={`coach-status ${
                                                        request.status
                                                            ?.toLowerCase()
                                                            ?.replace(" ", "-")
                                                    }`}
                                                >
                                                    {request.status}
                                                </span>

                                                {isApproved && (
                                                    <button
                                                        onClick={() => navigate("/coach/equipment")}
                                                        style={{
                                                            padding: "4px 10px",
                                                            backgroundColor: "#05c7ee",
                                                            color: "#07131a",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "4px"
                                                        }}
                                                    >
                                                        <RotateCcw size={12} />
                                                        Return Gear
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    );
                                })

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default CoachDashboard;