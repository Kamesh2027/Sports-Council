import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../../services/api";
import Modal from "../../components/common/Modal";
import {
  ClipboardList,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
  Clock,
  Package,
  Users,
  ShieldCheck,
  Wrench,
  AlertTriangle
} from "lucide-react";

const Requests = () => {
  const [activeTab, setActiveTab] = useState("equipment"); // "equipment" | "students"
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);

  // Issue Gear Form State
  const [issueForm, setIssueForm] = useState({
    equipmentId: "",
    requesterType: "student", // "student" | "coach"
    studentId: "",
    coachId: "",
    quantity: 1,
    dueDate: "",
    remarks: "Direct issue from Sports Council",
    status: "approved"
  });
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError, setIssueError] = useState("");

  const token = localStorage.getItem("token");

  // Load all necessary data
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [requestsRes, studentsRes, coachesRes, equipRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/admin/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/admin/students`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/admin/coaches`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/admin/equipment`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (requestsRes.status === "fulfilled") {
        setRequests(requestsRes.value.data.requests || []);
      } else {
        console.error("Requests load failed:", requestsRes.reason);
      }

      if (studentsRes.status === "fulfilled") {
        setStudents(studentsRes.value.data.students || []);
      }

      if (coachesRes.status === "fulfilled") {
        setCoaches(coachesRes.value.data.coaches || []);
      }

      if (equipRes.status === "fulfilled") {
        setEquipmentList(equipRes.value.data.equipment || []);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
      setError("Failed to load requests data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Request Status (Approve / Reject / Return)
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await axios.put(
        `${API_BASE}/admin/requests/${requestId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification(res.data.message || `Request updated to ${newStatus}.`);
      if (selectedDetailRequest && (selectedDetailRequest._id === requestId || selectedDetailRequest.requestId === requestId)) {
        setSelectedDetailRequest({ ...selectedDetailRequest, status: newStatus });
      }
      setTimeout(() => setNotification(""), 4000);
      loadData();
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || `Failed to update request to ${newStatus}.`);
    }
  };

  // Student Approval Update
  const handleStudentApproval = async (studentId, status) => {
    try {
      const res = await axios.put(
        `${API_BASE}/admin/students/${studentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification(res.data.message || `Student registration marked as ${status}.`);
      setTimeout(() => setNotification(""), 4000);
      loadData();
    } catch (err) {
      console.error("Student approval error:", err);
      alert(err.response?.data?.message || `Failed to update student approval.`);
    }
  };

  // Delete Request
  const handleDeleteRequest = async (item) => {
    if (!window.confirm(`Are you sure you want to delete request '${item.requestId}'?`)) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE}/admin/requests/${item._id || item.requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification(`Request ${item.requestId} was deleted.`);
      if (selectedDetailRequest?._id === item._id) setSelectedDetailRequest(null);
      setTimeout(() => setNotification(""), 4000);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete request.");
    }
  };

  // Open Issue Modal
  const handleOpenIssue = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    setIssueForm({
      equipmentId: equipmentList.length > 0 ? equipmentList[0]._id : "",
      requesterType: "student",
      studentId: students.length > 0 ? students[0]._id : "",
      coachId: coaches.length > 0 ? coaches[0]._id : "",
      quantity: 1,
      dueDate: nextWeek,
      remarks: "Direct gear loan issued by Admin",
      status: "approved"
    });
    setIssueError("");
    setShowIssueModal(true);
  };

  // Submit Issue Gear Form
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setIssueError("");

    if (!issueForm.equipmentId) {
      setIssueError("Please select an equipment item.");
      return;
    }

    if (Number(issueForm.quantity) < 1) {
      setIssueError("Quantity must be at least 1.");
      return;
    }

    setIssueLoading(true);

    try {
      const payload = {
        equipmentId: issueForm.equipmentId,
        studentId: issueForm.requesterType === "student" ? issueForm.studentId : null,
        coachId: issueForm.requesterType === "coach" ? issueForm.coachId : null,
        quantity: Number(issueForm.quantity),
        dueDate: issueForm.dueDate,
        remarks: issueForm.remarks,
        status: issueForm.status
      };

      const res = await axios.post(
        `${API_BASE}/admin/requests`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification(res.data.message || "Equipment loan logged successfully!");
      setShowIssueModal(false);
      setTimeout(() => setNotification(""), 4000);
      loadData();
    } catch (err) {
      console.error("Direct issue error:", err);
      setIssueError(err.response?.data?.message || "Failed to create equipment loan.");
    } finally {
      setIssueLoading(false);
    }
  };

  // Calculations & Filtering
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const returnedRequests = requests.filter((r) => r.status === "returned");
  const pendingStudents = students.filter((s) => s.approvalStatus === "pending");

  const filteredRequests = requests.filter((r) => {
    const equipName = r.equipmentId?.name || "";
    const equipId = r.equipmentId?.equipmentId || "";
    const reqId = r.requestId || "";
    const studentName = r.studentId?.name || "";
    const studentNum = r.studentId?.studentId || r.studentId?.registerNumber || "";
    const coachName = r.coachId?.name || "";
    const sport = r.equipmentId?.sport || "";

    const matchesSearch =
      reqId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sport.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || (r.status || "pending").toLowerCase() === statusFilter.toLowerCase();

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "student" && r.studentId) ||
      (roleFilter === "coach" && r.coachId && !r.studentId);

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadge = (req) => {
    if (req.status === "approved") {
      return <span className="status-badge success">Approved / Loaned</span>;
    }
    if (req.status === "returned") {
      const isDamaged = req.returnCondition === "damaged" || (req.damagedQuantityReturned || 0) > 0;
      return (
        <span
          style={{
            padding: "4px 8px",
            backgroundColor: isDamaged ? "rgba(239, 68, 68, 0.15)" : "rgba(5, 199, 238, 0.15)",
            border: `1px solid ${isDamaged ? "rgba(239, 68, 68, 0.3)" : "rgba(5, 199, 238, 0.3)"}`,
            borderRadius: "4px",
            color: isDamaged ? "#f87171" : "#05c7ee",
            fontSize: "12px",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          {isDamaged ? <Wrench size={12} /> : <CheckCircle2 size={12} />}
          {isDamaged
            ? `Returned (Damaged: ${req.damagedQuantityReturned || 1} units)`
            : "Returned (Good Condition)"}
        </span>
      );
    }
    if (req.status === "rejected") {
      return <span className="status-badge danger">Rejected</span>;
    }
    return <span className="status-badge warning">Pending Review</span>;
  };

  return (
    <div className="management-page">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, fontSize: "22px" }}>
            <ClipboardList size={24} color="#05c7ee" />
            Equipment & Member Requests
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#8da3b5", fontSize: "13px" }}>
            Review pending sports gear requests, issue equipment loans, track coach returns and damage reports, and manage athlete approvals.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="primary-btn"
            onClick={handleOpenIssue}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#05c7ee",
              color: "#07131a",
              fontWeight: "700",
              fontSize: "12px",
              padding: "10px 18px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            {/* <Plus size={18} /> */}
            ISSUE GEAR
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {notification && (
        <div
          style={{
            margin: "14px 0",
            padding: "12px 16px",
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "8px",
            color: "#4ade80",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <ShieldCheck size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Quick Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          margin: "16px 0"
        }}
      >
        {/* Total Requests */}
        <div
          style={{
            backgroundColor: "#1b2027",
            border: "1px solid #2b323a",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#8da3b5" }}>TOTAL REQUESTS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>{requests.length}</h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5, 199, 238, 0.1)", color: "#05c7ee" }}>
            <ClipboardList size={24} />
          </div>
        </div>

        {/* Pending Review */}
        <div
          style={{
            backgroundColor: "#1b2027",
            border: "1px solid #2b323a",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#8da3b5" }}>PENDING APPROVAL</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: pendingRequests.length > 0 ? "#facc15" : "#f0f6fc" }}>
              {pendingRequests.length}
            </h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(234, 179, 8, 0.1)", color: "#facc15" }}>
            <Clock size={24} />
          </div>
        </div>

        {/* Active Loans */}
        <div
          style={{
            backgroundColor: "#1b2027",
            border: "1px solid #2b323a",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#8da3b5" }}>ACTIVE GEAR LOANS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#4ade80" }}>{approvedRequests.length}</h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Returned Gear */}
        <div
          style={{
            backgroundColor: "#1b2027",
            border: "1px solid #2b323a",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#8da3b5" }}>RETURNED ITEMS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#38bdf8" }}>{returnedRequests.length}</h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.1)", color: "#38bdf8" }}>
            <RotateCcw size={24} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          borderBottom: "1px solid #21262d",
          paddingBottom: "8px"
        }}
      >
        <button
          onClick={() => setActiveTab("equipment")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "equipment" ? "#05c7ee" : "#161b22",
            color: activeTab === "equipment" ? "#07131a" : "#c9d1d9",
            fontWeight: "700",
            border: "1px solid #30363d",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px"
          }}
        >
          <Package size={16} />
          Equipment Loan Requests ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab("students")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "students" ? "#05c7ee" : "#161b22",
            color: activeTab === "students" ? "#07131a" : "#c9d1d9",
            fontWeight: "700",
            border: "1px solid #30363d",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px"
          }}
        >
          <Users size={16} />
          Pending Student Approvals ({pendingStudents.length})
        </button>
      </div>

      {/* TAB 1: EQUIPMENT REQUESTS */}
      {activeTab === "equipment" && (
        <>
          {/* Search & Filter Bar */}
          <div
            className="management-card"
            style={{
              padding: "14px 18px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px", flexWrap: "wrap" }}>
              {/* Search Box */}
              <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6e7681" }} />
                <input
                  type="text"
                  placeholder="Search by Request ID, item, athlete, coach..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all">All Statuses ({requests.length})</option>
                <option value="pending">Pending Review ({pendingRequests.length})</option>
                <option value="approved">Approved / Loaned ({approvedRequests.length})</option>
                <option value="returned">Returned ({returnedRequests.length})</option>
                <option value="rejected">Rejected ({requests.filter((r) => r.status === "rejected").length})</option>
              </select>

              {/* Requester Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all">All Requesters</option>
                <option value="student">Student Athletes Only</option>
                <option value="coach">Coaches Only</option>
              </select>
            </div>

            <button
              onClick={loadData}
              style={{
                padding: "8px 12px",
                backgroundColor: "#21262d",
                border: "1px solid #30363d",
                borderRadius: "6px",
                color: "#c9d1d9",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              title="Refresh requests list"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Requests Table Card */}
          <div className="management-card" style={{ padding: "0", overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #2b323a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <h2 style={{ margin: 0, fontSize: "16px", color: "#f0f6fc" }}>
                Equipment Loan Requests ({filteredRequests.length})
              </h2>
            </div>

            <div className="management-card-body" style={{ padding: "0" }}>
              {loading ? (
                <div className="empty-state" style={{ padding: "40px" }}>
                  <div className="dashboard-loading">Loading equipment requests...</div>
                </div>
              ) : error ? (
                <div className="empty-state" style={{ padding: "40px" }}>
                  <h3 style={{ color: "#f87171" }}>Unable to load requests</h3>
                  <p>{error}</p>
                  <button className="primary-btn" onClick={loadData} style={{ marginTop: "12px" }}>
                    Try Again
                  </button>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="empty-state" style={{ padding: "50px 20px", textAlign: "center" }}>
                  <ClipboardList size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
                  <h3>No Requests Found</h3>
                  <p style={{ color: "#8da3b5", maxWidth: "420px", margin: "0 auto 16px auto" }}>
                    {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                      ? "No requests match your current filters."
                      : "Equipment requests submitted by athletes or coaches will appear here."}
                  </p>
                  <button
                    className="primary-btn"
                    onClick={handleOpenIssue}
                    style={{
                      backgroundColor: "#05c7ee",
                      color: "#07131a",
                      fontWeight: "700",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    + Issue Equipment Now
                  </button>
                </div>
              ) : (
                <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
                  <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#14181e", textAlign: "left" }}>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>REQ ID</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>EQUIPMENT ITEM</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>REQUESTER</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>QTY</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>REQUEST / DUE DATE</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>STATUS / RETURN DETAILS</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a", textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRequests.map((req) => {
                        const equip = req.equipmentId || {};
                        const student = req.studentId;
                        const coach = req.coachId;
                        const returnedCoach = req.returnedByCoach;
                        const isStudent = !!student;
                        const isOverdue = req.dueDate && req.status === "approved" && new Date(req.dueDate) < new Date();

                        return (
                          <tr
                            key={req._id || req.requestId}
                            style={{
                              borderBottom: "1px solid #21262d",
                              transition: "background-color 0.15s"
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#161b22")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            {/* Request ID */}
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "rgba(56, 189, 248, 0.1)",
                                  border: "1px solid rgba(56, 189, 248, 0.25)",
                                  borderRadius: "4px",
                                  color: "#38bdf8",
                                  fontFamily: "monospace",
                                  fontWeight: "700",
                                  fontSize: "12px"
                                }}
                              >
                                {req.requestId}
                              </span>
                            </td>

                            {/* Equipment Item */}
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div
                                  style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "8px",
                                    backgroundColor: "rgba(5, 199, 238, 0.15)",
                                    color: "#05c7ee",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "15px"
                                  }}
                                >
                                  📦
                                </div>
                                <div>
                                  <strong style={{ color: "#f0f6fc", fontSize: "13px", display: "block" }}>
                                    {equip.name || "Sports Equipment"}
                                  </strong>
                                  <span style={{ fontSize: "11px", color: "#8da3b5" }}>
                                    {equip.sport || "General"} • {equip.category || "Gear"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Requester */}
                            <td style={{ padding: "14px 16px" }}>
                              <div>
                                <strong style={{ color: "#f0f6fc", fontSize: "13px", display: "block" }}>
                                  {isStudent ? student.name : coach ? coach.name : "Member"}
                                </strong>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                  <span
                                    style={{
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      fontSize: "10px",
                                      fontWeight: "700",
                                      backgroundColor: isStudent ? "rgba(168, 85, 247, 0.15)" : "rgba(5, 199, 238, 0.15)",
                                      color: isStudent ? "#a855f7" : "#05c7ee"
                                    }}
                                  >
                                    {isStudent ? "Student Athlete" : "Sports Coach"}
                                  </span>
                                  <span style={{ fontSize: "11px", color: "#8b949e" }}>
                                    {isStudent ? student.studentId || student.registerNumber : coach?.userId}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Quantity */}
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: "10px",
                                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                                  color: "#f0f6fc",
                                  fontWeight: "700",
                                  fontSize: "13px"
                                }}
                              >
                                {req.quantity} Units
                              </span>
                            </td>

                            {/* Request & Due Dates */}
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ fontSize: "12px" }}>
                                <span style={{ color: "#8da3b5", display: "block" }}>
                                  Req: {req.requestDate ? new Date(req.requestDate).toLocaleDateString() : "-"}
                                </span>
                                {req.dueDate && (
                                  <span
                                    style={{
                                      color: isOverdue ? "#f87171" : "#4ade80",
                                      fontWeight: isOverdue ? "700" : "normal",
                                      fontSize: "11px"
                                    }}
                                  >
                                    Due: {new Date(req.dueDate).toLocaleDateString()} {isOverdue && "(OVERDUE)"}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status & Return info */}
                            <td style={{ padding: "14px 16px" }}>
                              <div>
                                {getStatusBadge(req)}
                                {req.status === "returned" && (
                                  <div style={{ fontSize: "11px", color: "#8da3b5", marginTop: "4px" }}>
                                    Returned by: <span style={{ color: "#38bdf8" }}>{returnedCoach?.name || coach?.name || "Coach"}</span>
                                    {req.returnDate && ` on ${new Date(req.returnDate).toLocaleDateString()}`}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: "14px 16px", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                {/* Pending Actions: Approve / Reject */}
                                {req.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(req._id || req.requestId, "approved")}
                                      title="Approve Request & Issue Gear"
                                      style={{
                                        padding: "6px 10px",
                                        backgroundColor: "rgba(34, 197, 94, 0.15)",
                                        border: "1px solid rgba(34, 197, 94, 0.3)",
                                        borderRadius: "4px",
                                        color: "#4ade80",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px"
                                      }}
                                    >
                                      <CheckCircle2 size={13} />
                                      Approve
                                    </button>

                                    <button
                                      onClick={() => handleUpdateStatus(req._id || req.requestId, "rejected")}
                                      title="Reject Request"
                                      style={{
                                        padding: "6px 10px",
                                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        borderRadius: "4px",
                                        color: "#f87171",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px"
                                      }}
                                    >
                                      <XCircle size={13} />
                                      Reject
                                    </button>
                                  </>
                                )}

                                {/* View Details */}
                                <button
                                  onClick={() => setSelectedDetailRequest(req)}
                                  title="View Full Request Details & Return Breakdown"
                                  style={{
                                    padding: "6px 8px",
                                    backgroundColor: "rgba(56, 189, 248, 0.1)",
                                    border: "1px solid rgba(56, 189, 248, 0.25)",
                                    borderRadius: "4px",
                                    color: "#38bdf8",
                                    fontSize: "11px",
                                    cursor: "pointer"
                                  }}
                                >
                                  <Eye size={13} />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteRequest(req)}
                                  title="Delete Record"
                                  style={{
                                    padding: "6px 8px",
                                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    borderRadius: "4px",
                                    color: "#f87171",
                                    fontSize: "11px",
                                    cursor: "pointer"
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
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
        </>
      )}

      {/* TAB 2: PENDING STUDENT REGISTRATIONS */}
      {activeTab === "students" && (
        <div className="management-card" style={{ padding: "0", overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #2b323a",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", color: "#f0f6fc" }}>
                Student Athletes Pending Registration Approval ({pendingStudents.length})
              </h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#8da3b5" }}>
                Review and activate new student athlete portal registrations.
              </p>
            </div>
          </div>

          <div className="management-card-body" style={{ padding: "0" }}>
            {pendingStudents.length === 0 ? (
              <div className="empty-state" style={{ padding: "50px 20px", textAlign: "center" }}>
                <CheckCircle2 size={48} style={{ opacity: 0.3, color: "#4ade80", marginBottom: "12px" }} />
                <h3>All Clear! No Pending Approvals</h3>
                <p style={{ color: "#8da3b5", maxWidth: "420px", margin: "0 auto" }}>
                  All student athlete registration requests have been approved or processed.
                </p>
              </div>
            ) : (
              <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#14181e", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>STUDENT NAME</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>STUDENT ID / REG NO</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>SPORT / SQUAD</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>EMAIL & CONTACT</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>DEPARTMENT</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a", textAlign: "right" }}>DECISION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingStudents.map((st) => (
                      <tr
                        key={st._id}
                        style={{ borderBottom: "1px solid #21262d" }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#161b22")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <strong style={{ color: "#f0f6fc", fontSize: "13px" }}>{st.name}</strong>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "2px 6px",
                              backgroundColor: "rgba(56, 189, 248, 0.1)",
                              borderRadius: "4px",
                              color: "#38bdf8",
                              fontFamily: "monospace",
                              fontSize: "12px"
                            }}
                          >
                            {st.studentId || st.registerNumber}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              backgroundColor: "rgba(234, 179, 8, 0.15)",
                              border: "1px solid rgba(234, 179, 8, 0.3)",
                              borderRadius: "4px",
                              color: "#facc15",
                              fontSize: "11px",
                              fontWeight: "600"
                            }}
                          >
                            {st.sport || "General Athletics"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ color: "#8da3b5", fontSize: "12px", display: "block" }}>{st.email}</span>
                          <span style={{ color: "#6e7681", fontSize: "11px" }}>{st.phone || "-"}</span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#c9d1d9", fontSize: "12px" }}>
                          {st.department || "-"} {st.year ? `(${st.year})` : ""}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              onClick={() => handleStudentApproval(st._id, "approved")}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#238636",
                                border: "none",
                                borderRadius: "4px",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <CheckCircle2 size={13} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleStudentApproval(st._id, "rejected")}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "4px",
                                color: "#f87171",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ISSUE GEAR / LOG REQUEST */}
      {showIssueModal && (
        <Modal
          title="Issue Equipment Loan / Direct Request"
          onClose={() => setShowIssueModal(false)}
          maxWidth="560px"
        >
          <form onSubmit={handleIssueSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {issueError && (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  color: "#f87171",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <AlertCircle size={16} />
                <span>{issueError}</span>
              </div>
            )}

            {/* Equipment Selection */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Select Sports Equipment Item <span style={{ color: "#f87171" }}>*</span>
              </label>
              <select
                value={issueForm.equipmentId}
                onChange={(e) => setIssueForm({ ...issueForm, equipmentId: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                {equipmentList.length === 0 ? (
                  <option value="">No equipment in inventory</option>
                ) : (
                  equipmentList.map((eq) => (
                    <option key={eq._id} value={eq._id}>
                      {eq.name} ({eq.sport}) — Available: {eq.availableQuantity || 0} / Total: {eq.totalQuantity}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Requester Type Toggle */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Requester Type <span style={{ color: "#f87171" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIssueForm({ ...issueForm, requesterType: "student" })}
                  style={{
                    padding: "8px",
                    backgroundColor: issueForm.requesterType === "student" ? "rgba(5, 199, 238, 0.2)" : "#0d1117",
                    border: `1px solid ${issueForm.requesterType === "student" ? "#05c7ee" : "#30363d"}`,
                    borderRadius: "6px",
                    color: issueForm.requesterType === "student" ? "#05c7ee" : "#8da3b5",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Student Athlete
                </button>

                <button
                  type="button"
                  onClick={() => setIssueForm({ ...issueForm, requesterType: "coach" })}
                  style={{
                    padding: "8px",
                    backgroundColor: issueForm.requesterType === "coach" ? "rgba(5, 199, 238, 0.2)" : "#0d1117",
                    border: `1px solid ${issueForm.requesterType === "coach" ? "#05c7ee" : "#30363d"}`,
                    borderRadius: "6px",
                    color: issueForm.requesterType === "coach" ? "#05c7ee" : "#8da3b5",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Sports Coach
                </button>
              </div>
            </div>

            {/* Requester Dropdown */}
            {issueForm.requesterType === "student" ? (
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Select Student Athlete <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  value={issueForm.studentId}
                  onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  {students.length === 0 ? (
                    <option value="">No registered students found</option>
                  ) : (
                    students.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name} ({st.studentId || st.registerNumber}) — {st.department || "Athletics"}
                      </option>
                    ))
                  )}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Select Sports Coach <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  value={issueForm.coachId}
                  onChange={(e) => setIssueForm({ ...issueForm, coachId: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  {coaches.length === 0 ? (
                    <option value="">No registered coaches found</option>
                  ) : (
                    coaches.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.userId}) — {c.sport}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Quantity & Due Date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Quantity <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={issueForm.quantity}
                  onChange={(e) => setIssueForm({ ...issueForm, quantity: Math.max(1, Number(e.target.value)) })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Expected Return Due Date
                </label>
                <input
                  type="date"
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Status & Remarks */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Loan Status
              </label>
              <select
                value={issueForm.status}
                onChange={(e) => setIssueForm({ ...issueForm, status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <option value="approved">Approved & Issued (Deduct from Stock)</option>
                <option value="pending">Pending Approval (Hold / Review)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Remarks / Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. For Inter-Department match preparation"
                value={issueForm.remarks}
                onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                disabled={issueLoading}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={issueLoading}
                style={{
                  padding: "10px 22px",
                  backgroundColor: "#05c7ee",
                  border: "none",
                  borderRadius: "6px",
                  color: "#07131a",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: issueLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: issueLoading ? 0.7 : 1
                }}
              >
                {issueLoading ? "Processing..." : "Confirm & Issue Equipment"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: VIEW REQUEST DETAILS & RETURN BREAKDOWN */}
      {selectedDetailRequest && (
        <Modal
          title={`Request Details: ${selectedDetailRequest.requestId}`}
          onClose={() => setSelectedDetailRequest(null)}
          maxWidth="540px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", borderBottom: "1px solid #21262d" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#f0f6fc" }}>Current Status</span>
              {getStatusBadge(selectedDetailRequest)}
            </div>

            <table className="admin-table">
              <tbody>
                <tr>
                  <th style={{ width: "160px" }}>REQUEST ID</th>
                  <td>
                    <span
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "rgba(56, 189, 248, 0.1)",
                        borderRadius: "4px",
                        color: "#38bdf8",
                        fontFamily: "monospace",
                        fontWeight: "700"
                      }}
                    >
                      {selectedDetailRequest.requestId}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>EQUIPMENT</th>
                  <td>
                    <strong style={{ color: "#f0f6fc" }}>{selectedDetailRequest.equipmentId?.name || "Equipment"}</strong> (
                    {selectedDetailRequest.equipmentId?.sport || "General Athletics"})
                  </td>
                </tr>
                <tr>
                  <th>TOTAL UNITS</th>
                  <td>
                    <strong style={{ color: "#05c7ee" }}>{selectedDetailRequest.quantity} Units</strong>
                  </td>
                </tr>
                <tr>
                  <th>REQUESTER</th>
                  <td>
                    {selectedDetailRequest.studentId ? (
                      <div>
                        <strong style={{ color: "#f0f6fc" }}>{selectedDetailRequest.studentId.name}</strong> (Student)
                        <div style={{ fontSize: "11px", color: "#8da3b5" }}>
                          ID: {selectedDetailRequest.studentId.studentId || selectedDetailRequest.studentId.registerNumber} •{" "}
                          {selectedDetailRequest.studentId.email}
                        </div>
                      </div>
                    ) : selectedDetailRequest.coachId ? (
                      <div>
                        <strong style={{ color: "#f0f6fc" }}>{selectedDetailRequest.coachId.name}</strong> (Coach)
                        <div style={{ fontSize: "11px", color: "#8da3b5" }}>
                          ID: {selectedDetailRequest.coachId.userId} • {selectedDetailRequest.coachId.sport}
                        </div>
                      </div>
                    ) : (
                      "Member"
                    )}
                  </td>
                </tr>
                <tr>
                  <th>REQUEST DATE</th>
                  <td>
                    {selectedDetailRequest.requestDate
                      ? new Date(selectedDetailRequest.requestDate).toLocaleDateString()
                      : new Date(selectedDetailRequest.createdAt).toLocaleDateString()}
                  </td>
                </tr>
                <tr>
                  <th>DUE DATE</th>
                  <td>
                    {selectedDetailRequest.dueDate
                      ? new Date(selectedDetailRequest.dueDate).toLocaleDateString()
                      : "Not specified"}
                  </td>
                </tr>

                {/* Return Details Section if Returned */}
                {selectedDetailRequest.status === "returned" && (
                  <>
                    <tr style={{ backgroundColor: "rgba(5, 199, 238, 0.05)" }}>
                      <th style={{ color: "#05c7ee" }}>RETURN CONDITION</th>
                      <td>
                        <strong style={{ color: selectedDetailRequest.returnCondition === "damaged" ? "#f87171" : "#4ade80" }}>
                          {selectedDetailRequest.returnCondition === "damaged"
                            ? "⚠️ Damaged while playing"
                            : "✅ Normal Condition (Good)"}
                        </strong>
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: "rgba(5, 199, 238, 0.05)" }}>
                      <th style={{ color: "#05c7ee" }}>STOCK BREAKDOWN</th>
                      <td>
                        <div style={{ fontSize: "12px" }}>
                          <span style={{ color: "#4ade80", fontWeight: "700" }}>
                            +{selectedDetailRequest.goodQuantityReturned ?? (selectedDetailRequest.returnCondition === "good" ? selectedDetailRequest.quantity : 0)} Available Stock
                          </span>
                          {" • "}
                          <span style={{ color: "#f87171", fontWeight: "700" }}>
                            +{selectedDetailRequest.damagedQuantityReturned || 0} Damaged Stock
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: "rgba(5, 199, 238, 0.05)" }}>
                      <th style={{ color: "#05c7ee" }}>RETURNED BY COACH</th>
                      <td>
                        <strong style={{ color: "#f0f6fc" }}>
                          {selectedDetailRequest.returnedByCoach?.name || selectedDetailRequest.coachId?.name || "Respective Coach"}
                        </strong>
                        {selectedDetailRequest.returnDate && (
                          <div style={{ fontSize: "11px", color: "#8da3b5" }}>
                            on {new Date(selectedDetailRequest.returnDate).toLocaleString()}
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: "rgba(5, 199, 238, 0.05)" }}>
                      <th style={{ color: "#05c7ee" }}>RETURN NOTES</th>
                      <td>
                        <span style={{ color: "#f0f6fc" }}>
                          {selectedDetailRequest.returnRemarks || "Equipment returned by coach and stock updated automatically."}
                        </span>
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <th>INITIAL REMARKS</th>
                  <td>{selectedDetailRequest.remarks || "No remarks provided."}</td>
                </tr>
              </tbody>
            </table>

            {/* Quick Status Action inside Modal */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              {selectedDetailRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedDetailRequest._id, "approved")}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#238636",
                      border: "none",
                      borderRadius: "6px",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedDetailRequest._id, "rejected")}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "6px",
                      color: "#f87171",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Reject Request
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedDetailRequest(null)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Requests;