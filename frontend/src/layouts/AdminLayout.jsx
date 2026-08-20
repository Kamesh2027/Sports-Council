import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <Sidebar />

            <main className="admin-main">
                <Navbar />
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;