import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

// Auth Pages
import Login from "../pages/auth/Login";
import StudentRegister from "../pages/auth/StudentRegister";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Admin Layout & Pages
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Coaches from "../pages/admin/Coaches";
import AdminStudents from "../pages/admin/Students";
import Teams from "../pages/admin/Teams";
import AdminEquipment from "../pages/admin/Equipment";
import AdminRequests from "../pages/admin/Requests";
import AdminTournaments from "../pages/admin/Tournaments";
import AdminSchedules from "../pages/admin/Schedules";
import Venues from "../pages/admin/Venues";
import Reports from "../pages/admin/Reports";

// Coach Layout & Pages
import CoachLayout from "../layouts/CoachLayout";
import CoachDashboard from "../pages/coach/CoachDashboard";
import CoachStudents from "../pages/coach/Students";
import CoachTeam from "../pages/coach/Team";
import CoachEquipment from "../pages/coach/Equipment";
import CoachRequests from "../pages/coach/Requests";
import CoachTournaments from "../pages/coach/Tournaments";
import CoachSchedules from "../pages/coach/Schedules";

// Student Layout & Pages
import StudentLayout from "../layouts/StudentLayout";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentTeam from "../pages/student/Team";
import StudentEquipment from "../pages/student/Equipment";
import StudentRequests from "../pages/student/Requests";
import StudentTournaments from "../pages/student/Tournaments";
import StudentSchedules from "../pages/student/Schedules";
import StudentProfile from "../pages/student/Profile";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* AUTH */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<StudentRegister />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ADMIN */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route
                        index
                        element={<Navigate to="/admin/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="coaches" element={<Coaches />} />
                    <Route path="students" element={<AdminStudents />} />
                    <Route path="teams" element={<Teams />} />
                    <Route path="equipment" element={<AdminEquipment />} />
                    <Route path="requests" element={<AdminRequests />} />
                    <Route path="tournaments" element={<AdminTournaments />} />
                    <Route path="schedules" element={<AdminSchedules />} />
                    <Route path="venues" element={<Venues />} />
                    <Route path="reports" element={<Reports />} />
                </Route>

                {/* COACH */}
                <Route path="/coach" element={<CoachLayout />}>
                    <Route
                        index
                        element={<Navigate to="/coach/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<CoachDashboard />} />
                    <Route path="students" element={<CoachStudents />} />
                    <Route path="team" element={<CoachTeam />} />
                    <Route path="equipment" element={<CoachEquipment />} />
                    <Route path="requests" element={<CoachRequests />} />
                    <Route path="tournaments" element={<CoachTournaments />} />
                    <Route path="schedules" element={<CoachSchedules />} />
                </Route>

                {/* STUDENT */}
                <Route path="/student" element={<StudentLayout />}>
                    <Route
                        index
                        element={<Navigate to="/student/profile" replace />}
                    />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="team" element={<StudentTeam />} />
                    <Route path="equipment" element={<StudentEquipment />} />
                    <Route path="requests" element={<StudentRequests />} />
                    <Route path="tournaments" element={<StudentTournaments />} />
                    <Route path="schedules" element={<StudentSchedules />} />
                    <Route path="profile" element={<StudentProfile />} />
                </Route>

                {/* DEFAULT & FALLBACK */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;