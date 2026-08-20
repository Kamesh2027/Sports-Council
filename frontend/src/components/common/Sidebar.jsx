import {
    LayoutDashboard,
    UsersRound,
    GraduationCap,
    UserRound,
    Dumbbell,
    ClipboardList,
    Trophy,
    CalendarDays,
    MapPin,
    FileText,
    CircleHelp,
    LogOut,
    Plus
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/icons/logo1.png";

const Sidebar = () => {

    const { logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Coaches",
            path: "/admin/coaches",
            icon: UsersRound
        },
        {
            name: "Students",
            path: "/admin/students",
            icon: GraduationCap
        },
        {
            name: "Teams",
            path: "/admin/teams",
            icon: UserRound
        },
        {
            name: "Equipment",
            path: "/admin/equipment",
            icon: Dumbbell
        },
        {
            name: "Requests",
            path: "/admin/requests",
            icon: ClipboardList
        },
        {
            name: "Tournaments",
            path: "/admin/tournaments",
            icon: Trophy
        },
        {
            name: "Schedules",
            path: "/admin/schedules",
            icon: CalendarDays
        },
        {
            name: "Venues",
            path: "/admin/venues",
            icon: MapPin
        },
        {
            name: "Reports",
            path: "/admin/reports",
            icon: FileText
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
                    <h2>BIT Sports Council</h2>
                    {/* <span>ADMIN</span> */}
                </div>

            </div>


            {/* ADD EVENT */}
            {/* <button
                className="add-event-btn"
                onClick={() => navigate("/admin/tournaments")}
            >
                <Plus size={15} />
                ADD EVENT
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

                            <span>
                                {item.name.toUpperCase()}
                            </span>

                        </NavLink>
                    );
                })}

            </nav>


            {/* BOTTOM */}
            <div className="sidebar-bottom">

                {/* <button className="nav-item support">
                    <CircleHelp size={18} />
                    <span>SUPPORT</span>
                </button> */}

                <button
                    className="nav-item logout"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>SIGN OUT</span>
                </button>

            </div>

        </aside>
    );
};

export default Sidebar;