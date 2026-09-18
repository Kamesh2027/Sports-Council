import {
    LayoutDashboard,
    UsersRound,
    UserRound,
    Dumbbell,
    ClipboardList,
    Trophy,
    CalendarDays,
    RotateCcw,
    LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/icons/logo1.png";

const CoachSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/coach/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "My Team",
            path: "/coach/team",
            icon: UserRound
        },
        {
            name: "Students",
            path: "/coach/students",
            icon: UsersRound
        },
        {
            name: "Equipment & Returns",
            path: "/coach/equipment",
            icon: Dumbbell
        },
        {
            name: "Requests",
            path: "/coach/requests",
            icon: ClipboardList
        },
        {
            name: "Tournaments",
            path: "/coach/tournaments",
            icon: Trophy
        },
        {
            name: "Schedules",
            path: "/coach/schedules",
            icon: CalendarDays
        }
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className="admin-sidebar">
            {/* BRAND */}
            <div className="brand-section">
                <div className="brand-logo">
                    <img src={logo} alt="BIT Sports Council Logo" className="logo-img" />
                </div>
                <div>
                    <h2>BIT SPORTS COUNCIL</h2>
                    <span>COACH PORTAL</span>
                </div>
            </div>

            {/* RETURN EQUIPMENT QUICK ACTION BUTTON */}
            {/* <button
                className="add-event-btn"
                style={{
                    backgroundColor: "#05c7ee",
                    color: "#07131a",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    border: "none",
                    padding: "10px",
                    marginBottom: "16px",
                    fontSize: "12px"
                }}
                onClick={() => navigate("/coach/equipment")}
            >
                <RotateCcw size={16} /> RETURN EQUIPMENT
            </button> */}

            {/* NAVIGATION */}
            <nav className="admin-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <Icon size={18} />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* BOTTOM */}
            <div className="sidebar-bottom">
                <button
                    className="nav-item logout"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default CoachSidebar;