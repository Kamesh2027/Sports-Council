import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "../pages/auth/Login";

import AdminLayout from "../layouts/AdminLayout";

import AdminDashboard from "../pages/admin/AdminDashboard";
import Coaches from "../pages/admin/Coaches";
import Students from "../pages/admin/Students";
import Teams from "../pages/admin/Teams";
import Equipment from "../pages/admin/Equipment";
import Requests from "../pages/admin/Requests";
import Tournaments from "../pages/admin/Tournaments";
import Schedules from "../pages/admin/Schedules";
import Venues from "../pages/admin/Venues";
import Reports from "../pages/admin/Reports";
import StudentRegister from "../pages/auth/StudentRegister";


function AppRoutes() {

    return (
        <BrowserRouter>

            <Routes>

                {/* LOGIN */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* ADMIN */}

                <Route
                    path="/admin"
                    element={<AdminLayout />}
                >

                    <Route
                        index
                        element={
                            <Navigate
                                to="/admin/dashboard"
                                replace
                            />
                        }
                    />

                    <Route
                        path="dashboard"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="coaches"
                        element={<Coaches />}
                    />

                    <Route
                        path="students"
                        element={<Students />}
                    />

                    <Route
                        path="teams"
                        element={<Teams />}
                    />

                    <Route
                        path="equipment"
                        element={<Equipment />}
                    />

                    <Route
                        path="requests"
                        element={<Requests />}
                    />

                    <Route
                        path="tournaments"
                        element={<Tournaments />}
                    />

                    <Route
                        path="schedules"
                        element={<Schedules />}
                    />

                    <Route
                        path="venues"
                        element={<Venues />}
                    />

                    <Route
                        path="reports"
                        element={<Reports />}
                    />

                </Route>


                {/* DEFAULT */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                <Route
                    path="/register"
                    element={<StudentRegister />}
                />


            </Routes>

        </BrowserRouter>
    );
}

export default AppRoutes;