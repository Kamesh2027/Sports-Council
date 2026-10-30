import {
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router-dom";

import {
    Search,
    Bell,
    Settings,
    UserCircle,
    Plus,
    LayoutDashboard,
    Users,
    GraduationCap,
    UserRoundCog,
    Dumbbell,
    ClipboardList,
    Trophy,
    CalendarDays,
    MapPin,
    FileText,
    HelpCircle,
    LogOut,
    Download,
    Activity,
    Package,
    Clock,
    Map,
    CheckCircle,
    AlertCircle,
    Wrench,
    ShieldCheck,
    RotateCcw
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import adminService from "../../services/adminService";
import Modal from "../../components/common/Modal";
import CoachForm from "../../components/common/CoachForm";

import "../../styles/admin.css";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [showAddCoachModal, setShowAddCoachModal] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState("");


    // =========================
    // LOAD DASHBOARD (REAL-TIME)
    // =========================

    const loadDashboard = async (isSilent = false) => {
        try {
            if (!isSilent) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }

            setError("");

            const data = await adminService.getDashboard();
            setDashboard(data);

        } catch (err) {
            console.error("Dashboard real-time update error:", err);
            if (!isSilent) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load dashboard"
                );
            }
        } finally {
            if (!isSilent) {
                setLoading(false);
            }
            setIsRefreshing(false);
        }
    };


    useEffect(() => {
        loadDashboard();

        // Real-time polling every 4 seconds
        const pollInterval = setInterval(() => {
            loadDashboard(true);
        }, 4000);

        return () => clearInterval(pollInterval);
    }, []);


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading dashboard...
            </div>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (
            <div className="dashboard-error">

                <h2>
                    Unable to load dashboard
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={loadDashboard}
                >
                    Try Again
                </button>

            </div>
        );
    }


    if (!dashboard) {
        return null;
    }


    const {
        stats,
        activities,
        tournaments,
        venues
    } = dashboard;


    return (

        <div className="admin-dashboard">

            {/* ================= MAIN ================= */}

            {/* <main className="admin-main"> */}

                {/* CONTENT */}

                <section className="dashboard-content">


                    {/* HEADER */}

                    <div className="page-heading">

                        <div>

                            <h1 className="page-title" style={{ paddingTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                                <span>Admin Dashboard</span>
                                
                                {/* <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <button
                                        className="export-btn"
                                        onClick={() => setShowAddCoachModal(true)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            backgroundColor: "#05c7ee",
                                            color: "#07131a",
                                            fontWeight: "700",
                                            fontSize: "12px",
                                            padding: "8px 14px",
                                            borderRadius: "6px",
                                            border: "none",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <Plus size={16} />
                                        ADD COACH
                                    </button>

                                    <button className="export-btn">
                                        <Download size={15} />
                                        EXPORT
                                    </button>
                                </div> */}
                            </h1>

                        </div>

                    </div>

                    {/* NOTIFICATION MESSAGE */}
                    {notificationMsg && (
                        <div
                            style={{
                                margin: "14px 0",
                                padding: "12px 16px",
                                backgroundColor: "rgba(34, 197, 94, 0.15)",
                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                borderRadius: "8px",
                                color: "#4ade80",
                                fontSize: "13px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            <ShieldCheck size={18} />
                            <span>{notificationMsg}</span>
                        </div>
                    )}


                    {/* ================= STATS ================= */}

                    <div className="stats-grid">


                        <div className="stat-card" style={{ position: "relative" }}>

                            <div className="stat-header">

                                <span>
                                    COACHES
                                </span>

                                <UserRoundCog size={18} />

                            </div>

                            <h2>
                                {stats.coaches}
                            </h2>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                                <p style={{ margin: 0 }}>
                                    Registered coaches
                                </p>
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-header">

                                <span>
                                    STUDENTS
                                </span>

                                <GraduationCap size={18} />

                            </div>

                            <h2>
                                {stats.students}
                            </h2>

                            <p>
                                Registered students
                            </p>

                        </div>


                        <div className="stat-card">

                            <div className="stat-header">

                                <span>
                                    TEAMS
                                </span>

                                <Users size={18} />

                            </div>

                            <h2>
                                {stats.teams}
                            </h2>

                            <p>
                                Active teams
                            </p>

                        </div>


                        <div className="stat-card">

                            <div className="stat-header">

                                <span>
                                    EQUIPMENT
                                </span>

                                <Package size={18} />

                            </div>

                            <h2>
                                {stats.equipment}
                            </h2>

                            <p>
                                Total equipment
                            </p>

                        </div>


                        <div className="stat-card highlight-card">

                            <div className="stat-header">

                                <span>
                                    PENDING REQUESTS
                                </span>

                                <ClipboardList size={18} />

                            </div>

                            <h2>
                                {stats.pendingRequests}
                            </h2>

                            <p>
                                Requires action
                            </p>

                        </div>

                    </div>


                    {/* ================= LOWER GRID ================= */}

                    <div className="dashboard-grid">


                        {/* ACTIVITIES */}

                        <div className="panel activity-panel">

                            <div className="panel-header">

                                <div className="panel-title">
                                    <Activity size={18} />
                                    <h3>Recent Activities</h3>
                                    <span className="live-indicator">
                                        <span className="live-dot"></span>
                                        LIVE
                                    </span>
                                </div>

                                <button
                                    className="refresh-activities-btn"
                                    onClick={() => loadDashboard(true)}
                                    title="Click to refresh activities in real time"
                                >
                                    <RotateCcw size={13} className={isRefreshing ? "spin-icon" : ""} />
                                    <span>Sync</span>
                                </button>

                            </div>


                            <div className="activity-table">

                                <div className="activity-heading">
                                    <span>TIME</span>
                                    <span>ACTION</span>
                                    <span>USER</span>
                                    <span>STATUS</span>
                                </div>


                                {(!activities || activities.length === 0) ? (

                                    <div className="empty-state">
                                        No activities yet.
                                    </div>

                                ) : (

                                    activities.map((activity) => {
                                        const actionText = activity.action || activity.message || activity.type || "System Activity";
                                        const userText = activity.user || (activity.role ? activity.role.toUpperCase() : "ADMIN");
                                        const statusText = activity.status || "COMPLETED";

                                        let badgeClass = "success";
                                        const sLower = statusText.toLowerCase();
                                        const tLower = (activity.type || "").toLowerCase();
                                        if (sLower.includes("reject") || sLower.includes("delet") || tLower.includes("danger")) {
                                            badgeClass = "danger";
                                        } else if (sLower.includes("pending") || tLower.includes("warning")) {
                                            badgeClass = "warning";
                                        } else if (sLower.includes("update") || sLower.includes("edit") || tLower.includes("info")) {
                                            badgeClass = "info";
                                        }

                                        return (
                                            <div className="activity-row" key={activity._id}>
                                                <span className="activity-time">
                                                    {new Date(activity.createdAt).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>

                                                <span className="activity-action" title={actionText}>
                                                    {actionText}
                                                </span>

                                                <span className="activity-user">
                                                    <span className="user-pill">{userText}</span>
                                                </span>

                                                <span>
                                                    <span className={`status-badge ${badgeClass}`}>
                                                        {statusText}
                                                    </span>
                                                </span>
                                            </div>
                                        );
                                    })

                                )}

                            </div>

                        </div>


                        {/* RIGHT COLUMN */}

                        <div className="right-column">


                            {/* TOURNAMENTS */}

                            <div className="panel">

                                <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                                    <div className="panel-title">

                                        <Trophy size={18} />

                                        <h3>
                                            Active Tournaments
                                        </h3>

                                    </div>

                                    <button
                                        onClick={() => navigate("/admin/tournaments")}
                                        style={{
                                            backgroundColor: "transparent",
                                            border: "none",
                                            color: "#05c7ee",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Manage ➜
                                    </button>

                                </div>


                                <div className="tournament-list">

                                    {tournaments.length === 0 ? (

                                        <div className="empty-state">
                                            No active tournaments.
                                        </div>

                                    ) : (

                                        tournaments.map(
                                            (tournament) => (

                                                <div
                                                    className="tournament-item"
                                                    key={
                                                        tournament._id
                                                    }
                                                >

                                                    <div className="tournament-icon">

                                                        <Trophy size={18} />

                                                    </div>


                                                    <div>

                                                        <h4>
                                                            {
                                                                tournament.name
                                                            }
                                                        </h4>

                                                        <p>

                                                            {tournament.status}

                                                        </p>

                                                    </div>

                                                </div>

                                            )
                                        )

                                    )}

                                </div>

                            </div>


                            {/* VENUES */}

                            <div className="panel venue-panel">

                                <div className="panel-header">

                                    <div className="panel-title">

                                        <Map size={18} />

                                        <h3>
                                            Venue Status
                                        </h3>

                                    </div>

                                </div>


                                <div className="venue-list">

                                    {venues.length === 0 ? (

                                        <div className="empty-state">
                                            No venues available.
                                        </div>

                                    ) : (

                                        venues.map(
                                            (venue) => (

                                                <div
                                                    className="venue-item"
                                                    key={
                                                        venue._id
                                                    }
                                                >

                                                    <div className="venue-name">

                                                        <CheckCircle
                                                            size={15}
                                                        />

                                                        <span>
                                                            {
                                                                venue.name
                                                            }
                                                        </span>

                                                    </div>


                                                    <strong>
                                                        {
                                                            venue.status
                                                        }
                                                    </strong>

                                                </div>

                                            )
                                        )

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            {/* </main> */}

            {/* ADD COACH MODAL */}
            {showAddCoachModal && (
                <Modal
                    title="Register New Sports Coach"
                    onClose={() => setShowAddCoachModal(false)}
                    maxWidth="560px"
                >
                    <CoachForm
                        onSuccess={(newCoach) => {
                            setShowAddCoachModal(false);
                            setNotificationMsg(`Coach ${newCoach?.name || ""} registered successfully!`);
                            setTimeout(() => setNotificationMsg(""), 4000);
                            loadDashboard();
                        }}
                        onCancel={() => setShowAddCoachModal(false)}
                    />
                </Modal>
            )}

        </div>
    );
};

export default AdminDashboard;