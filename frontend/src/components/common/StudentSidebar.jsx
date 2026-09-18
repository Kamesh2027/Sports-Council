import {
    UserRound,
    UsersRound,
    Dumbbell,
    ClipboardList,
    Trophy,
    CalendarDays,
    LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/icons/logo1.png";

const StudentSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "My Profile",
            path: "/student/profile",
            icon: UserRound
        },
        {
            name: "My Squad",
            path: "/student/team",
            icon: UsersRound
        },
        {
            name: "Equipment",
            path: "/student/equipment",
            icon: Dumbbell
        },
        {
            name: "My Requests",
            path: "/student/requests",
            icon: ClipboardList
        },
        {
            name: "Tournaments",
            path: "/student/tournaments",
            icon: Trophy
        },
        {
            name: "Match Schedules",
            path: "/student/schedules",
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
                    <span>STUDENT ATHLETE PORTAL</span>
                </div>
            </div>

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

export default StudentSidebar;
