import {
    useEffect,
    useState
} from "react";

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
    Wrench
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import adminService from "../../services/adminService";

import "../../styles/admin.css";

import "./AdminDashboard.css";

const AdminDashboard = () => {

    const {
        user,
        logout
    } = useAuth();


    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================
    // LOAD DASHBOARD
    // =========================

    const loadDashboard = async () => {

        try {

            setLoading(true);

            setError("");

            const data =
                await adminService.getDashboard();

            setDashboard(data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load dashboard"
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadDashboard();

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

                            <h1 className="page-title">
                                Admin Dashboard
                                <button className="export-btn">
        
                                    <Download size={15} />
        
                                    EXPORT
        
                                </button>
                            </h1>

                            {/* <p>
                                System status and key
                                metrics for current
                                operations.
                            </p> */}

                        </div>



                    </div>


                    {/* ================= STATS ================= */}

                    <div className="stats-grid">


                        <div className="stat-card">

                            <div className="stat-header">

                                <span>
                                    COACHES
                                </span>

                                <UserRoundCog size={18} />

                            </div>

                            <h2>
                                {stats.coaches}
                            </h2>

                            <p>
                                Registered coaches
                            </p>

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

                                    <h3>
                                        Recent Activities
                                    </h3>

                                </div>

                            </div>


                            <div className="activity-table">

                                <div className="activity-heading">

                                    <span>
                                        TIME
                                    </span>

                                    <span>
                                        ACTION
                                    </span>

                                    <span>
                                        USER
                                    </span>

                                    <span>
                                        STATUS
                                    </span>

                                </div>


                                {activities.length === 0 ? (

                                    <div className="empty-state">

                                        No activities yet.

                                    </div>

                                ) : (

                                    activities.map(
                                        (activity) => (

                                            <div
                                                className="activity-row"
                                                key={
                                                    activity._id
                                                }
                                            >

                                                <span>
                                                    {new Date(
                                                        activity.createdAt
                                                    ).toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        }
                                                    )}
                                                </span>


                                                <span>
                                                    {
                                                        activity.action
                                                    }
                                                </span>


                                                <span>
                                                    {
                                                        activity.user
                                                    }
                                                </span>


                                                <span>

                                                    <span
                                                        className={`status-badge ${activity.type}`}
                                                    >
                                                        {
                                                            activity.status
                                                        }
                                                    </span>

                                                </span>

                                            </div>

                                        )
                                    )

                                )}

                            </div>

                        </div>


                        {/* RIGHT COLUMN */}

                        <div className="right-column">


                            {/* TOURNAMENTS */}

                            <div className="panel">

                                <div className="panel-header">

                                    <div className="panel-title">

                                        <Trophy size={18} />

                                        <h3>
                                            Active Tournaments
                                        </h3>

                                    </div>

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


                                <button className="manage-venues">

                                    MANAGE VENUES

                                </button>

                            </div>

                        </div>

                    </div>

                </section>

            {/* </main> */}

        </div>
    );
};

export default AdminDashboard;