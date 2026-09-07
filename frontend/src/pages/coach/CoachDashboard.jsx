import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

import "./CoachDashboard.css";

const CoachDashboard = () => {

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

                <div className="coach-page-heading">

                    <div>

                        <h1>
                            Coach Dashboard
                        </h1>

                        <p>
                            Manage your team, players, equipment and
                            upcoming matches.
                        </p>

                    </div>

                </div>


                {/* =========================
                    STAT CARDS
                ========================= */}

                <div className="coach-stats-grid">


                    {/* TEAM */}

                    <div className="coach-stat-card">

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
                            Assigned team
                        </p>

                    </div>


                    {/* STUDENTS */}

                    <div className="coach-stat-card">

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

                    <div className="coach-stat-card">

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
                            Assigned equipment
                        </p>

                    </div>


                    {/* REQUESTS */}

                    <div className="coach-stat-card highlight-coach-card">

                        <div className="coach-stat-header">

                            <span>
                                REQUESTS
                            </span>

                            <div className="coach-stat-icon">
                                📋
                            </div>

                        </div>

                        <h2>
                            {dashboard?.stats?.pendingRequests || 0}
                        </h2>

                        <p>
                            Pending equipment requests
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
                        EQUIPMENT REQUESTS
                    ========================= */}

                    <div className="coach-panel">

                        <div className="coach-panel-header">

                            <div className="coach-panel-title">

                                <span>
                                    📦
                                </span>

                                <h3>
                                    Equipment Requests
                                </h3>

                            </div>

                        </div>


                        <div className="coach-request-list">

                            {dashboard?.requests?.length === 0 ? (

                                <div className="coach-empty">

                                    <h3>
                                        No equipment requests
                                    </h3>

                                    <p>
                                        Your equipment requests will appear here.
                                    </p>

                                </div>

                            ) : (

                                dashboard?.requests?.map((request) => (

                                    <div
                                        className="coach-request-item"
                                        key={request._id}
                                    >

                                        <div>

                                            <h4>
                                                {request.equipment?.name ||
                                                    request.equipmentName ||
                                                    "Equipment"}
                                            </h4>

                                            <p>
                                                Quantity:{" "}
                                                {request.quantity || 0}
                                            </p>

                                        </div>


                                        <span
                                            className={`coach-status ${
                                                request.status
                                                    ?.toLowerCase()
                                                    ?.replace(" ", "-")
                                            }`}
                                        >
                                            {request.status}
                                        </span>

                                    </div>

                                ))

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default CoachDashboard;