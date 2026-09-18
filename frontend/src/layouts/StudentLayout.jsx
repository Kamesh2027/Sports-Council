import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/common/StudentSidebar";
import Navbar from "../components/common/Navbar";

const StudentLayout = () => {
    return (
        <div className="admin-layout">
            <StudentSidebar />

            <main className="admin-main">
                <Navbar />
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
