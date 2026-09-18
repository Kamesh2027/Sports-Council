import { Outlet } from "react-router-dom";
import CoachSidebar from "../components/common/CoachSidebar";
import Navbar from "../components/common/Navbar";

const CoachLayout = () => {
    return (
        <div className="admin-layout">
            <CoachSidebar />

            <main className="admin-main">
                <Navbar />
                <Outlet />
            </main>
        </div>
    );
};

export default CoachLayout;