import { Outlet } from "react-router-dom";
import CoachSidebar from "../components/common/CoachSidebar";

const CoachLayout = () => {
    return (
        <div className="admin-layout">
            <CoachSidebar />

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default CoachLayout;