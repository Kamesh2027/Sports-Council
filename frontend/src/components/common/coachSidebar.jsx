import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CoachSidebar = () => {

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className="admin-sidebar">

            {/* BRAND */}
            <div className="brand-section">

                <div className="brand-logo">
                    🏟️
                </div>

                <div>
                    <h2>BIT Sports</h2>
                    <span>COACH PORTAL</span>
                </div>

            </div>


            {/* ADD EVENT */}
            <button className="add-event-btn">
                ＋ ADD EVENT
            </button>


            {/* NAVIGATION */}
            <nav className="admin-nav">

                <NavLink
                    to="/coach/dashboard"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <span>▣</span>
                    <span>DASHBOARD</span>
                </NavLink>


                <NavLink
                    to="/coach/students"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <span>♙</span>
                    <span>STUDENTS</span>
                </NavLink>


                <NavLink
                    to="/coach/team"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <span>♟</span>
                    <span>MY TEAM</span>
                </NavLink>


                <NavLink
                    to="/coach/equipment"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <span>⚽</span>
                    <span>EQUIPMENT</span>
                </NavLink>


                <NavLink
                    to="/coach/requests"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <span>▤</span>
                    <span>REQUESTS</span>
                </NavLink>


                <NavLink
                    to="/coach/tournaments"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <span>🏆</span>
                    <span>TOURNAMENTS</span>
                </NavLink>


                <NavLink
                    to="/coach/schedules"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <span>▣</span>
                    <span>SCHEDULES</span>
                </NavLink>

            </nav>


            {/* BOTTOM */}
            <div className="sidebar-bottom">

                <div className="nav-item">
                    <span>?</span>
                    <span>SUPPORT</span>
                </div>

                <button
                    className="nav-item logout"
                    onClick={handleLogout}
                >
                    <span>↪</span>
                    <span>SIGN OUT</span>
                </button>

            </div>

        </aside>
    );
};

export default CoachSidebar;