import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ClipboardList,
  Search,
  Plus,
  RefreshCw,
  Dumbbell,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar
} from "lucide-react";
import "../../styles/admin.css";
import { API_BASE } from "../../services/api";

const StudentRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/student/requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error("Fetch requests error:", err);
      setError(
        err.response?.data?.message || "Failed to load your equipment request history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved" || r.status === "issued").length;
  const returnedCount = requests.filter((r) => r.status === "returned").length;

  const filtered = requests.filter((req) => {
    const matchSearch =
      searchQuery === "" ||
      req.requestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.equipmentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.remarks?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && (req.status === "approved" || req.status === "issued")) ||
      req.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "issued":
        return {
          bg: "rgba(16, 185, 129, 0.15)",
          color: "#34d399",
          label: "ISSUED / IN HAND",
          icon: CheckCircle2
        };
      case "pending":
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          color: "#fbbf24",
          label: "PENDING APPROVAL",
          icon: Clock
        };
      case "returned":
        return {
          bg: "rgba(5, 199, 238, 0.15)",
          color: "#38bdf8",
          label: "RETURNED",
          icon: RotateCcw
        };
      case "rejected":
        return {
          bg: "rgba(239, 68, 68, 0.15)",
          color: "#f87171",
          label: "REJECTED",
          icon: XCircle
        };
      default:
        return {
          bg: "rgba(141, 163, 181, 0.15)",
          color: "#8da3b5",
          label: status?.toUpperCase() || "UNKNOWN",
          icon: Clock
        };
    }
  };

  return (
    <div className="management-page" style={{ padding: "24px", color: "#c9d1d9" }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#f0f6fc", margin: "0 0 6px" }}>
            My Equipment Requests & Loans
          </h1>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            Track the status of your sports gear loan requests, active items in hand, and return history.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/student/equipment")}
            style={{
              padding: "9px 18px",
              backgroundColor: "#05c7ee",
              border: "none",
              borderRadius: "6px",
              color: "#07131a",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 0 14px rgba(5, 199, 238, 0.35)"
            }}
          >
            <Plus size={16} /> Request Gear
          </button>

          <button
            onClick={fetchRequests}
            style={{
              padding: "9px 15px",
              backgroundColor: "#21262d",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#c9d1d9",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "600"
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            color: "#f87171",
            marginBottom: "20px",
            fontSize: "13px"
          }}
        >
          {error}
        </div>
      )}

      {/* METRIC CHIPS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "14px", borderLeft: "4px solid #05c7ee" }}>
          <div style={{ fontSize: "11px", color: "#8da3b5", fontWeight: "700" }}>TOTAL REQUESTS</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#f0f6fc", marginTop: "4px" }}>{totalCount}</div>
        </div>

        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "14px", borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "11px", color: "#8da3b5", fontWeight: "700" }}>ISSUED / IN HAND</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#34d399", marginTop: "4px" }}>{approvedCount}</div>
        </div>

        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "14px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "11px", color: "#8da3b5", fontWeight: "700" }}>PENDING APPROVAL</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#fbbf24", marginTop: "4px" }}>{pendingCount}</div>
        </div>

        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "14px", borderLeft: "4px solid #38bdf8" }}>
          <div style={{ fontSize: "11px", color: "#8da3b5", fontWeight: "700" }}>RETURNED ITEMS</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#38bdf8", marginTop: "4px" }}>{returnedCount}</div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
          {[
            { id: "all", label: "All Requests" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Issued / In Hand" },
            { id: "returned", label: "Returned" },
            { id: "rejected", label: "Rejected" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: "7px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                border: "1px solid",
                backgroundColor: statusFilter === tab.id ? "#05c7ee" : "#161b22",
                color: statusFilter === tab.id ? "#07131a" : "#c9d1d9",
                borderColor: statusFilter === tab.id ? "#05c7ee" : "#30363d"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "6px",
            padding: "8px 12px",
            width: "260px"
          }}
        >
          <Search size={15} color="#8da3b5" />
          <input
            type="text"
            placeholder="Filter requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "#f0f6fc",
              fontSize: "12px",
              width: "100%"
            }}
          />
        </div>
      </div>

      {/* REQUESTS TABLE */}
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "10px",
          overflow: "hidden"
        }}
      >
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8da3b5" }}>
            <RefreshCw size={24} className="animate-spin" style={{ marginBottom: "8px" }} />
            <p>Loading requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8da3b5" }}>
            <ClipboardList size={36} style={{ opacity: 0.3, marginBottom: "10px" }} />
            <p>No equipment requests match your criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#0d1117", borderBottom: "1px solid #21262d", color: "#8da3b5" }}>
                  <th style={{ padding: "12px 16px" }}>Request ID</th>
                  <th style={{ padding: "12px 16px" }}>Equipment Item</th>
                  <th style={{ padding: "12px 16px" }}>Qty</th>
                  <th style={{ padding: "12px 16px" }}>Requested On</th>
                  <th style={{ padding: "12px 16px" }}>Return Due</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px" }}>Purpose / Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => {
                  const badge = getStatusBadge(req.status);
                  const Icon = badge.icon;
                  return (
                    <tr
                      key={req._id || req.requestId}
                      style={{
                        borderBottom: "1px solid #21262d",
                        transition: "background 0.1s ease"
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: "#05c7ee", fontWeight: "700" }}>
                        {req.requestId || `REQ-${req._id?.slice(-4)}`}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <strong style={{ color: "#f0f6fc", display: "block" }}>
                          {req.equipmentId?.name || "Sports Equipment"}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#8da3b5" }}>
                          {req.equipmentId?.category || req.equipmentId?.sport || "General"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#f0f6fc", fontWeight: "700" }}>
                        {req.quantity || 1}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#8da3b5" }}>
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#c9d1d9" }}>
                        {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : "7 Days"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 9px",
                            borderRadius: "4px",
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontSize: "11px",
                            fontWeight: "700"
                          }}
                        >
                          <Icon size={12} />
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#8da3b5", maxWidth: "200px" }}>
                        {req.remarks || "Standard practice request"}
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
  );
};

export default StudentRequests;
