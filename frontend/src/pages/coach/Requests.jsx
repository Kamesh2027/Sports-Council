import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../services/api";
import Modal from "../../components/common/Modal";
import {
  ClipboardList,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
  Search,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  User,
  Wrench
} from "lucide-react";

const CoachRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Return Modal state
  const [returningRequest, setReturningRequest] = useState(null);
  const [returnCondition, setReturnCondition] = useState("good"); // "good" | "damaged" | "partial_damaged"
  const [damagedCount, setDamagedCount] = useState(1);
  const [returnRemarks, setReturnRemarks] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/coach/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open Return Modal
  const handleOpenReturnModal = (request) => {
    setReturningRequest(request);
    setReturnCondition("good");
    setDamagedCount(request.quantity || 1);
    setReturnRemarks("");
    setReturnError("");
  };

  // Submit Return
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnError("");

    if (!returningRequest) return;

    setReturnLoading(true);

    try {
      const payload = {
        condition: returnCondition,
        damagedCount: returnCondition !== "good" ? Number(damagedCount) : 0,
        remarks: returnRemarks.trim() || (returnCondition === "good" ? "Returned in good condition" : `Returned with ${damagedCount} damaged units while playing.`)
      };

      const res = await axios.post(
        `${API_BASE}/coach/requests/${returningRequest._id || returningRequest.requestId}/return`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotification(res.data.message || "Equipment return processed successfully!");
      setReturningRequest(null);
      setTimeout(() => setNotification(""), 5000);
      loadRequests();
    } catch (err) {
      console.error("Return error:", err);
      setReturnError(err.response?.data?.message || "Failed to process return.");
    } finally {
      setReturnLoading(false);
    }
  };

  const activeLoans = requests.filter((r) => r.status === "approved");
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const returnedRequests = requests.filter((r) => r.status === "returned");

  const filteredRequests = requests.filter((r) => {
    const equipName = r.equipmentName || r.equipment?.name || "";
    const studentName = r.studentId?.name || "";
    const studentId = r.studentId?.studentId || r.studentId?.registerNumber || "";
    const reqId = r.requestId || "";

    const matchesSearch =
      equipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reqId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || (r.status || "pending").toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (req) => {
    if (req.status === "approved") {
      return <span className="status-badge success">Approved / In Use</span>;
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
    return <span className="status-badge warning">Pending Approval</span>;
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
            Squad Equipment Loans & Returns
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#8da3b5", fontSize: "13px" }}>
            Monitor equipment issued to your squad athletes, track return dates, and process equipment returns directly.
          </p>
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

      {/* Metrics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          margin: "16px 0"
        }}
      >
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>ACTIVE LOANS TO SQUAD</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#4ade80" }}>{activeLoans.length}</h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }}>
            <Package size={24} />
          </div>
        </div>

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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>PENDING APPROVAL</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#facc15" }}>{pendingRequests.length}</h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(234, 179, 8, 0.1)", color: "#facc15" }}>
            <Clock size={24} />
          </div>
        </div>

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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>RETURNED ITEMS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#05c7ee" }}>{returnedRequests.length}</h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5, 199, 238, 0.1)", color: "#05c7ee" }}>
            <RotateCcw size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6e7681" }} />
            <input
              type="text"
              placeholder="Search by equipment, athlete, request ID..."
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

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
            <option value="approved">Active Loans ({activeLoans.length})</option>
            <option value="returned">Returned ({returnedRequests.length})</option>
            <option value="pending">Pending ({pendingRequests.length})</option>
          </select>
        </div>

        <button
          onClick={loadRequests}
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
            Squad Equipment Requests & Loans ({filteredRequests.length})
          </h2>
        </div>

        <div className="management-card-body" style={{ padding: "0" }}>
          {loading ? (
            <div className="empty-state" style={{ padding: "40px" }}>
              <div className="dashboard-loading">Loading squad requests...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state" style={{ padding: "50px 20px", textAlign: "center" }}>
              <ClipboardList size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
              <h3>No Requests Found</h3>
              <p style={{ color: "#8da3b5", maxWidth: "400px", margin: "0 auto" }}>
                {searchQuery || filterStatus !== "all"
                  ? "No equipment requests match your active filters."
                  : "No equipment requests have been submitted by your squad athletes yet."}
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#14181e", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>REQ ID</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>EQUIPMENT ITEM</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>ATHLETE</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>QUANTITY</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>DUE DATE</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>STATUS</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a", textAlign: "right" }}>COACH ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => {
                    const isApproved = request.status === "approved";
                    const isReturned = request.status === "returned";
                    const student = request.studentId;

                    return (
                      <tr
                        key={request._id || request.requestId}
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
                              borderRadius: "4px",
                              color: "#38bdf8",
                              fontFamily: "monospace",
                              fontWeight: "700",
                              fontSize: "12px"
                            }}
                          >
                            {request.requestId || "REQ"}
                          </span>
                        </td>

                        {/* Equipment */}
                        <td style={{ padding: "14px 16px" }}>
                          <strong style={{ color: "#f0f6fc", fontSize: "13px", display: "block" }}>
                            {request.equipmentName || request.equipment?.name || "Equipment"}
                          </strong>
                          <span style={{ fontSize: "11px", color: "#8da3b5" }}>
                            {request.equipment?.category || "Sports Gear"}
                          </span>
                        </td>

                        {/* Athlete */}
                        <td style={{ padding: "14px 16px" }}>
                          {student ? (
                            <div>
                              <strong style={{ color: "#f0f6fc", fontSize: "13px", display: "block" }}>
                                {student.name}
                              </strong>
                              <span style={{ fontSize: "11px", color: "#8da3b5" }}>
                                ID: {student.studentId || student.registerNumber}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: "#8da3b5", fontSize: "12px" }}>Assigned to Coach / Squad</span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ color: "#f0f6fc", fontWeight: "700", fontSize: "13px" }}>
                            {request.quantity || 1} Units
                          </span>
                        </td>

                        {/* Due Date */}
                        <td style={{ padding: "14px 16px", color: "#8da3b5", fontSize: "12px" }}>
                          {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : "-"}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 16px" }}>
                          {getStatusBadge(request)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          {isApproved ? (
                            <button
                              onClick={() => handleOpenReturnModal(request)}
                              style={{
                                padding: "8px 14px",
                                backgroundColor: "#05c7ee",
                                border: "none",
                                borderRadius: "6px",
                                color: "#07131a",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              <RotateCcw size={14} />
                              Return Equipment
                            </button>
                          ) : isReturned ? (
                            <span style={{ color: "#8da3b5", fontSize: "12px" }}>
                              Returned on {request.returnDate ? new Date(request.returnDate).toLocaleDateString() : "Record"}
                            </span>
                          ) : (
                            <span style={{ color: "#6e7681", fontSize: "12px" }}>Awaiting admin approval</span>
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

      {/* COACH RETURN EQUIPMENT MODAL */}
      {returningRequest && (
        <Modal
          title={`Return Equipment: ${returningRequest.equipmentName || returningRequest.equipment?.name}`}
          onClose={() => setReturningRequest(null)}
          maxWidth="520px"
        >
          <form onSubmit={handleReturnSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {returnError && (
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
                <span>{returnError}</span>
              </div>
            )}

            {/* Loan Summary Info */}
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#0d1117",
                border: "1px solid #21262d",
                borderRadius: "8px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "#8da3b5" }}>Equipment Item:</span>
                <strong style={{ color: "#f0f6fc", fontSize: "13px" }}>
                  {returningRequest.equipmentName || returningRequest.equipment?.name}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "#8da3b5" }}>Athlete / Requester:</span>
                <span style={{ color: "#38bdf8", fontSize: "12px", fontWeight: "600" }}>
                  {returningRequest.studentId?.name || "Squad Member"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#8da3b5" }}>Total Units Loaned:</span>
                <strong style={{ color: "#05c7ee", fontSize: "13px" }}>{returningRequest.quantity || 1} Units</strong>
              </div>
            </div>

            {/* Return Condition Choice */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "8px" }}>
                Select Return Condition <span style={{ color: "#f87171" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {/* Normal Condition */}
                <button
                  type="button"
                  onClick={() => {
                    setReturnCondition("good");
                    setDamagedCount(0);
                  }}
                  style={{
                    padding: "12px",
                    backgroundColor: returnCondition === "good" ? "rgba(34, 197, 94, 0.15)" : "#0d1117",
                    border: `2px solid ${returnCondition === "good" ? "#22c55e" : "#30363d"}`,
                    borderRadius: "8px",
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4ade80", fontWeight: "700", fontSize: "13px" }}>
                    <CheckCircle2 size={16} />
                    Normal Condition
                  </div>
                  <p style={{ margin: "4px 0 0 0", color: "#8da3b5", fontSize: "11px" }}>
                    Gear is intact & immediately added back to Available Stock.
                  </p>
                </button>

                {/* Damaged while playing */}
                <button
                  type="button"
                  onClick={() => {
                    setReturnCondition("damaged");
                    setDamagedCount(returningRequest.quantity || 1);
                  }}
                  style={{
                    padding: "12px",
                    backgroundColor: returnCondition === "damaged" ? "rgba(239, 68, 68, 0.15)" : "#0d1117",
                    border: `2px solid ${returnCondition === "damaged" ? "#ef4444" : "#30363d"}`,
                    borderRadius: "8px",
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f87171", fontWeight: "700", fontSize: "13px" }}>
                    <AlertTriangle size={16} />
                    Damaged while playing
                  </div>
                  <p style={{ margin: "4px 0 0 0", color: "#8da3b5", fontSize: "11px" }}>
                    Record units damaged during play / match (updates Damaged Stock).
                  </p>
                </button>
              </div>
            </div>

            {/* Damaged Units input if damaged */}
            {returnCondition === "damaged" && (
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Number of Damaged Units (out of {returningRequest.quantity || 1}) <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={returningRequest.quantity || 1}
                  value={damagedCount}
                  onChange={(e) => setDamagedCount(Math.min(returningRequest.quantity || 1, Math.max(1, Number(e.target.value))))}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#f87171",
                    fontWeight: "700",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                <div style={{ fontSize: "11px", color: "#8da3b5", marginTop: "4px" }}>
                  Remaining {Math.max(0, (returningRequest.quantity || 1) - damagedCount)} units will be returned to Available Stock.
                </div>
              </div>
            )}

            {/* Remarks / Incident details */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Return Notes / Damage Remarks
              </label>
              <textarea
                rows="3"
                placeholder={returnCondition === "damaged" ? "Describe how damage occurred (e.g., Football torn during varsity match second half, Bat cracked at handle...)" : "Optional return remarks..."}
                value={returnRemarks}
                onChange={(e) => setReturnRemarks(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical"
                }}
              />
            </div>

            {/* Auto-update Notice */}
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "rgba(5, 199, 238, 0.08)",
                border: "1px solid rgba(5, 199, 238, 0.2)",
                borderRadius: "6px",
                color: "#38bdf8",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <ShieldCheck size={16} />
              <span>
                Inventory counts and available stock update automatically upon confirming return.
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
              <button
                type="button"
                onClick={() => setReturningRequest(null)}
                disabled={returnLoading}
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
                disabled={returnLoading}
                style={{
                  padding: "10px 22px",
                  backgroundColor: returnCondition === "damaged" ? "#dc2626" : "#05c7ee",
                  border: "none",
                  borderRadius: "6px",
                  color: returnCondition === "damaged" ? "#ffffff" : "#07131a",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: returnLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: returnLoading ? 0.7 : 1
                }}
              >
                <RotateCcw size={16} />
                {returnLoading ? "Processing Return..." : "Confirm Return & Update Stock"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CoachRequests;