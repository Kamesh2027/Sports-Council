import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // 'all', 'pending', 'approved', 'rejected'
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get("http://localhost:5000/api/admin/students", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setStudents(res.data.students || []);
        } catch (err) {
            console.error("Failed to load students:", err);
            setError(
                err.response?.data?.message || "Failed to load students data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    // Handle student approval / rejection
    const handleApproval = async (studentId, status) => {
        setActionLoadingId(studentId);
        setNotification(null);
        setError("");

        try {
            const res = await axios.put(
                `http://localhost:5000/api/admin/students/${studentId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Update local state immediately
            setStudents((prev) =>
                prev.map((s) =>
                    s._id === studentId || s.studentId === studentId
                        ? { ...s, approvalStatus: status }
                        : s
                )
            );

            setNotification({
                type: status === "approved" ? "success" : "danger",
                message: res.data.message || `Student status updated to ${status}.`
            });
        } catch (err) {
            console.error("Failed to update status:", err);
            setError(
                err.response?.data?.message || `Failed to set status to ${status}.`
            );
        } finally {
            setActionLoadingId(null);
        }
    };

    // Calculate status counts
    const pendingCount = useMemo(
        () => students.filter((s) => s.approvalStatus === "pending").length,
        [students]
    );
    const approvedCount = useMemo(
        () => students.filter((s) => s.approvalStatus === "approved").length,
        [students]
    );
    const rejectedCount = useMemo(
        () => students.filter((s) => s.approvalStatus === "rejected").length,
        [students]
    );

    // Filtered students
    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const matchesTab =
                activeTab === "all" || s.approvalStatus === activeTab;

            const name = s.name || "";
            const regNo = s.registerNumber || "";
            const email = s.email || "";
            const phone = s.phone || "";
            const coachName = s.coachId?.name || s.coachUserId || "";
            const dept = s.department || "";

            const matchesSearch =
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                phone.includes(searchTerm) ||
                coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dept.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesTab && matchesSearch;
        });
    }, [students, activeTab, searchTerm]);

    const getStatusBadge = (status) => {
        if (status === "approved") {
            return <span className="status-badge success">Approved</span>;
        }
        if (status === "pending") {
            return <span className="status-badge warning">Pending Approval</span>;
        }
        if (status === "rejected") {
            return <span className="status-badge danger">Rejected</span>;
        }
        return <span className="status-badge processing">{status || "Pending"}</span>;
    };

    return (
        <div className="management-page">
            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <h1>Student Athlete Management</h1>
                    <p>
                        Review new student registrations, manage approvals, and oversee active athletes.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        className="primary-btn"
                        onClick={loadStudents}
                        disabled={loading}
                        style={{ cursor: "pointer" }}
                    >
                        <span>🔄</span> {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="stats-grid" style={{ marginBottom: "20px" }}>
                <div className="stat-card">
                    <div className="stat-header">
                        <span>TOTAL REGISTRATIONS</span>
                        <div className="stat-icon">👥</div>
                    </div>
                    <h2>{students.length}</h2>
                    <p>All student records</p>
                </div>

                <div className={`stat-card ${pendingCount > 0 ? "highlight-card" : ""}`}>
                    <div className="stat-header">
                        <span>PENDING APPROVALS</span>
                        <div className="stat-icon">⏳</div>
                    </div>
                    <h2 style={{ color: pendingCount > 0 ? "#e8a91b" : "inherit" }}>
                        {pendingCount}
                    </h2>
                    <p>Awaiting admin action</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span>APPROVED ATHLETES</span>
                        <div className="stat-icon">✅</div>
                    </div>
                    <h2>{approvedCount}</h2>
                    <p>Active login access</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span>REJECTED</span>
                        <div className="stat-icon">❌</div>
                    </div>
                    <h2>{rejectedCount}</h2>
                    <p>Declined requests</p>
                </div>
            </div>

            {/* NOTIFICATIONS / ALERTS */}
            {notification && (
                <div
                    style={{
                        background: notification.type === "success" ? "rgba(12, 51, 41, 0.9)" : "rgba(59, 31, 33, 0.9)",
                        border: notification.type === "success" ? "1px solid #35d49b" : "1px solid #ef8585",
                        color: notification.type === "success" ? "#35d49b" : "#ef8585",
                        padding: "12px 16px",
                        borderRadius: "6px",
                        marginBottom: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <span>{notification.message}</span>
                    <button
                        onClick={() => setNotification(null)}
                        style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {error && (
                <div className="error" style={{ marginBottom: "16px" }}>
                    {error}
                </div>
            )}

            {/* TABS & SEARCH BAR */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                    flexWrap: "wrap"
                }}
            >
                {/* FILTER TABS */}
                <div style={{ display: "flex", gap: "6px", background: "#1b2027", padding: "4px", borderRadius: "8px", border: "1px solid #2b323a" }}>
                    <button
                        onClick={() => setActiveTab("all")}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "5px",
                            border: "none",
                            background: activeTab === "all" ? "#05c7ee" : "transparent",
                            color: activeTab === "all" ? "#07131a" : "#9da9b4",
                            fontWeight: 700,
                            fontSize: "11px",
                            cursor: "pointer"
                        }}
                    >
                        All ({students.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("pending")}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "5px",
                            border: "none",
                            background: activeTab === "pending" ? "#e8a91b" : "transparent",
                            color: activeTab === "pending" ? "#1c1404" : "#e8a91b",
                            fontWeight: 700,
                            fontSize: "11px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}
                    >
                        Pending Approvals
                        {pendingCount > 0 && (
                            <span
                                style={{
                                    background: activeTab === "pending" ? "#1c1404" : "#e8a91b",
                                    color: activeTab === "pending" ? "#e8a91b" : "#1c1404",
                                    padding: "1px 6px",
                                    borderRadius: "10px",
                                    fontSize: "9px"
                                }}
                            >
                                {pendingCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab("approved")}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "5px",
                            border: "none",
                            background: activeTab === "approved" ? "#35d49b" : "transparent",
                            color: activeTab === "approved" ? "#07261c" : "#9da9b4",
                            fontWeight: 700,
                            fontSize: "11px",
                            cursor: "pointer"
                        }}
                    >
                        Approved ({approvedCount})
                    </button>

                    <button
                        onClick={() => setActiveTab("rejected")}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "5px",
                            border: "none",
                            background: activeTab === "rejected" ? "#ef8585" : "transparent",
                            color: activeTab === "rejected" ? "#2b1012" : "#9da9b4",
                            fontWeight: 700,
                            fontSize: "11px",
                            cursor: "pointer"
                        }}
                    >
                        Rejected ({rejectedCount})
                    </button>
                </div>

                {/* SEARCH INPUT */}
                <div className="search-container" style={{ flex: 1, maxWidth: "380px" }}>
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Search student, roll no, phone, coach..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            style={{ background: "none", border: "none", color: "#8da3b5", cursor: "pointer" }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="management-card">
                <div className="management-card-header">
                    <h2>
                        {activeTab === "pending"
                            ? "Pending Student Registrations"
                            : activeTab === "approved"
                            ? "Approved Student Athletes"
                            : activeTab === "rejected"
                            ? "Rejected Registrations"
                            : "All Registered Students"}
                    </h2>
                    <span style={{ fontSize: "11px", color: "#05c7ee", fontWeight: 700 }}>
                        {filteredStudents.length} Students
                    </span>
                </div>

                <div className="management-card-body">
                    {loading ? (
                        <div className="empty-state">
                            <div className="stat-icon" style={{ marginBottom: "12px" }}>⏳</div>
                            <h3>Loading student records...</h3>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="empty-state">
                            <div style={{ fontSize: "36px", marginBottom: "10px" }}>👥</div>
                            <h3>No Students Registered Yet</h3>
                            <p>When new students register from the portal, their requests will appear here for review.</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="empty-state">
                            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
                            <h3>No Students Found</h3>
                            <p>No student records match the active filter "{activeTab}" or search "{searchTerm}".</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>STUDENT</th>
                                        <th>ROLL / REG NO</th>
                                        <th>CONTACT DETAILS</th>
                                        <th>ASSIGNED COACH</th>
                                        <th>DEPT & YEAR</th>
                                        <th>REG. DATE</th>
                                        <th>STATUS</th>
                                        <th style={{ textAlign: "center" }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => {
                                        const isActioning = actionLoadingId === student._id;

                                        return (
                                            <tr key={student._id || student.studentId}>
                                                {/* NAME */}
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <div
                                                            style={{
                                                                width: "32px",
                                                                height: "32px",
                                                                borderRadius: "50%",
                                                                background: "#172d35",
                                                                color: "#05c7ee",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontWeight: 800,
                                                                fontSize: "12px"
                                                            }}
                                                        >
                                                            {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                                                        </div>
                                                        <div>
                                                            <strong style={{ color: "#e7edf2", display: "block" }}>
                                                                {student.name}
                                                            </strong>
                                                            <span style={{ fontSize: "9px", color: "#8da3b5" }}>
                                                                ID: {student.studentId || "-"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ROLL NUMBER */}
                                                <td>
                                                    <span style={{ color: "#05c7ee", fontWeight: 700 }}>
                                                        {student.registerNumber}
                                                    </span>
                                                </td>

                                                {/* CONTACT */}
                                                <td>
                                                    <div style={{ fontSize: "10px" }}>
                                                        <div style={{ color: "#cbd3da", marginBottom: "2px" }}>
                                                            ✉️ {student.email}
                                                        </div>
                                                        {student.phone && (
                                                            <div style={{ color: "#35d49b", display: "flex", alignItems: "center", gap: "4px" }}>
                                                                📱 +91 {student.phone} <span style={{ fontSize: "8px", background: "#0c3329", padding: "1px 4px", borderRadius: "3px" }}>OTP Verified ✓</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* COACH & SQUAD */}
                                                <td>
                                                    <div>
                                                        <strong style={{ color: "#e7edf2", display: "block" }}>
                                                            {student.coachId?.name || student.coachUserId || "Unassigned"}
                                                        </strong>
                                                        <span style={{ fontSize: "11px", color: "#35d49b", fontWeight: 700, display: "block" }}>
                                                            🏆 {student.teamId?.name || student.coachId?.teamName || (student.coachId?.sport ? `${student.coachId.sport} Team` : "General Squad")}
                                                        </span>
                                                        <span style={{ fontSize: "9px", color: "#05c7ee" }}>
                                                            {student.coachId?.sport ? `Sport: ${student.coachId.sport}` : (student.coachUserId ? `Coach ID: ${student.coachUserId}` : "")}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* DEPT & YEAR */}
                                                <td>
                                                    <div>
                                                        <span style={{ color: "#cbd3da" }}>
                                                            {student.department || "General"}
                                                        </span>
                                                        <span style={{ fontSize: "9px", color: "#8da3b5", display: "block" }}>
                                                            Year {student.year || 1}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* REG DATE */}
                                                <td>
                                                    <span style={{ color: "#8da3b5", fontSize: "10px" }}>
                                                        {student.createdAt
                                                            ? new Date(student.createdAt).toLocaleDateString()
                                                            : "-"}
                                                    </span>
                                                </td>

                                                {/* STATUS */}
                                                <td>
                                                    {getStatusBadge(student.approvalStatus)}
                                                </td>

                                                {/* ACTIONS */}
                                                <td style={{ textAlign: "center" }}>
                                                    {student.approvalStatus === "pending" ? (
                                                        <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                                                            <button
                                                                onClick={() => handleApproval(student._id, "approved")}
                                                                disabled={isActioning}
                                                                style={{
                                                                    padding: "5px 10px",
                                                                    background: "#0c3329",
                                                                    color: "#35d49b",
                                                                    border: "1px solid #35d49b",
                                                                    borderRadius: "4px",
                                                                    fontSize: "10px",
                                                                    fontWeight: 800,
                                                                    cursor: isActioning ? "not-allowed" : "pointer"
                                                                }}
                                                            >
                                                                {isActioning ? "..." : "✓ Approve"}
                                                            </button>

                                                            <button
                                                                onClick={() => handleApproval(student._id, "rejected")}
                                                                disabled={isActioning}
                                                                style={{
                                                                    padding: "5px 10px",
                                                                    background: "#3b1f21",
                                                                    color: "#ef8585",
                                                                    border: "1px solid #ef8585",
                                                                    borderRadius: "4px",
                                                                    fontSize: "10px",
                                                                    fontWeight: 800,
                                                                    cursor: isActioning ? "not-allowed" : "pointer"
                                                                }}
                                                            >
                                                                {isActioning ? "..." : "✕ Reject"}
                                                            </button>
                                                        </div>
                                                    ) : student.approvalStatus === "approved" ? (
                                                        <button
                                                            onClick={() => handleApproval(student._id, "rejected")}
                                                            disabled={isActioning}
                                                            style={{
                                                                padding: "4px 8px",
                                                                background: "transparent",
                                                                color: "#ef8585",
                                                                border: "1px solid #4a282b",
                                                                borderRadius: "4px",
                                                                fontSize: "9px",
                                                                cursor: isActioning ? "not-allowed" : "pointer"
                                                            }}
                                                        >
                                                            Revoke Access
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApproval(student._id, "approved")}
                                                            disabled={isActioning}
                                                            style={{
                                                                padding: "4px 8px",
                                                                background: "transparent",
                                                                color: "#35d49b",
                                                                border: "1px solid #1a4a3a",
                                                                borderRadius: "4px",
                                                                fontSize: "9px",
                                                                cursor: isActioning ? "not-allowed" : "pointer"
                                                            }}
                                                        >
                                                            Re-Approve
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Students;