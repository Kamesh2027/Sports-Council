import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../services/api";
import Modal from "../../components/common/Modal";
import {
  Users,
  Package,
  Trophy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

const Team = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");

  // Return Modal
  const [returningItem, setReturningItem] = useState(null);
  const [returnCondition, setReturnCondition] = useState("good");
  const [damagedCount, setDamagedCount] = useState(0);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnRemarks, setReturnRemarks] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/coach/team`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTeam(response.data.team || null);
    } catch (error) {
      console.error("Failed to load team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = (item) => {
    setReturningItem(item);
    setReturnQuantity(item.quantity || 1);
    setReturnCondition("good");
    setDamagedCount(0);
    setReturnRemarks("");
    setReturnError("");
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnError("");

    if (!returningItem) return;

    setReturnLoading(true);

    try {
      const isDamaged = returnCondition === "damaged";
      const finalDamagedCount = isDamaged ? Math.min(returnQuantity, Math.max(1, Number(damagedCount) || returnQuantity)) : 0;

      const payload = {
        equipmentId: returningItem.equipmentId?._id || returningItem.equipmentId || returningItem._id,
        quantity: Number(returnQuantity),
        condition: returnCondition,
        damagedCount: finalDamagedCount,
        remarks: returnRemarks.trim() || (isDamaged ? `Returned ${finalDamagedCount} damaged units from squad gear.` : "Squad gear returned in good condition.")
      };

      const res = await axios.post(
        `${API_BASE}/coach/equipment/return`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification(res.data.message || "Equipment returned to inventory successfully!");
      setReturningItem(null);
      setTimeout(() => setNotification(""), 5000);
      loadTeam();
    } catch (err) {
      console.error("Return error:", err);
      setReturnError(err.response?.data?.message || "Failed to process equipment return.");
    } finally {
      setReturnLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="management-page">
        <div className="empty-state">
          <h3>Loading team...</h3>
        </div>
      </div>
    );
  }

  const equipments = team?.equipments || [];
  const students = team?.students || [];

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Trophy size={24} color="#05c7ee" />
            My Team & Squad
          </h1>
          <p>
            View your assigned squad profile, student athletes, and allocated sports equipment with direct return management.
          </p>
        </div>
      </div>

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

      {!team ? (
        <div className="management-card">
          <div className="empty-state">
            <h3>No Team Assigned</h3>
            <p>
              You have not been assigned to a team yet.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Team Information Card */}
          <div className="management-card" style={{ marginBottom: "20px" }}>
            <div className="management-card-header">
              <h2>Team Overview</h2>
              <span className="status-badge success">
                {team.status || "Active"}
              </span>
            </div>

            <div className="management-card-body">
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <tbody>
                    <tr>
                      <th style={{ width: "200px" }}>TEAM NAME</th>
                      <td>
                        <strong style={{ color: "#f0f6fc", fontSize: "15px" }}>{team.name}</strong>
                      </td>
                    </tr>
                    <tr>
                      <th>TEAM ID</th>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            backgroundColor: "rgba(56, 189, 248, 0.1)",
                            border: "1px solid rgba(56, 189, 248, 0.25)",
                            borderRadius: "4px",
                            color: "#38bdf8",
                            fontFamily: "monospace",
                            fontWeight: "700",
                            fontSize: "12px"
                          }}
                        >
                          {team.teamId || "-"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>SPORT DISCIPLINE</th>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            backgroundColor: "rgba(234, 179, 8, 0.15)",
                            border: "1px solid rgba(234, 179, 8, 0.3)",
                            borderRadius: "4px",
                            color: "#facc15",
                            fontWeight: "600",
                            fontSize: "12px"
                          }}
                        >
                          {team.sport || "-"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>TOTAL SQUAD ATHLETES</th>
                      <td>
                        <span style={{ color: "#4ade80", fontWeight: "700" }}>
                          {students.length} Athletes
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>ALLOCATED GEAR ITEMS</th>
                      <td>
                        <span style={{ color: "#05c7ee", fontWeight: "700" }}>
                          {equipments.reduce((acc, eq) => acc + (eq.quantity || 0), 0)} Total Units ({equipments.length} Items)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Allocated Sports Equipment & Quantities */}
          <div className="management-card" style={{ marginBottom: "20px" }}>
            <div className="management-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="#05c7ee" />
                Allocated Sports Equipments & Quantities
              </h2>
              <span style={{ fontSize: "12px", color: "#8da3b5" }}>
                {equipments.length} Gear Types Allocated
              </span>
            </div>

            <div className="management-card-body">
              {equipments.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 20px", textAlign: "center" }}>
                  <Package size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
                  <h3 style={{ fontSize: "15px" }}>No Equipment Allocated Yet</h3>
                  <p style={{ color: "#8da3b5", fontSize: "13px" }}>
                    Sports equipment allocated to your squad by administration will appear here with assigned quantities.
                  </p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>EQUIPMENT ITEM</th>
                        <th>EQUIPMENT ID</th>
                        <th>CATEGORY</th>
                        <th>ALLOCATED QUANTITY</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: "right" }}>COACH ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipments.map((eq, idx) => {
                        const eqDetails = eq.equipmentId || {};
                        return (
                          <tr key={eq._id || eqDetails._id || idx}>
                            <td>
                              <strong style={{ color: "#f0f6fc" }}>
                                {eq.name || eqDetails.name || "Sports Equipment"}
                              </strong>
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: "2px 6px",
                                  backgroundColor: "rgba(56, 189, 248, 0.1)",
                                  border: "1px solid rgba(56, 189, 248, 0.25)",
                                  borderRadius: "4px",
                                  color: "#38bdf8",
                                  fontFamily: "monospace",
                                  fontSize: "12px"
                                }}
                              >
                                {eqDetails.equipmentId || "-"}
                              </span>
                            </td>
                            <td>{eqDetails.category || "General Gear"}</td>
                            <td>
                              <span
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: "10px",
                                  backgroundColor: "rgba(5, 199, 238, 0.15)",
                                  color: "#05c7ee",
                                  fontWeight: "700",
                                  fontSize: "13px"
                                }}
                              >
                                {eq.quantity || 0} Units
                              </span>
                            </td>
                            <td>
                              <span className="status-badge success">
                                In Squad Possession
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                onClick={() => handleOpenReturnModal(eq)}
                                style={{
                                  padding: "6px 12px",
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
                                Return Gear
                              </button>
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

          {/* Team Members */}
          <div className="management-card">
            <div className="management-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} color="#05c7ee" />
                Team Athletes ({students.length})
              </h2>
            </div>

            <div className="management-card-body">
              {students.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>NAME</th>
                        <th>STUDENT ID</th>
                        <th>REGISTER NUMBER</th>
                        <th>EMAIL</th>
                        <th>DEPARTMENT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id}>
                          <td>
                            <strong style={{ color: "#f0f6fc" }}>{student.name}</strong>
                          </td>
                          <td>
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
                              {student.studentId}
                            </span>
                          </td>
                          <td>{student.registerNumber || "-"}</td>
                          <td>{student.email}</td>
                          <td>{student.department || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: "30px 20px", textAlign: "center" }}>
                  <Users size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
                  <h3 style={{ fontSize: "15px" }}>No Team Members</h3>
                  <p style={{ color: "#8da3b5", fontSize: "13px" }}>
                    No students are currently assigned to this team.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* SQUAD GEAR RETURN MODAL */}
      {returningItem && (
        <Modal
          title={`Return Squad Equipment: ${returningItem.name || returningItem.equipmentId?.name}`}
          onClose={() => setReturningItem(null)}
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

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Quantity to Return (out of {returningItem.quantity || 1}) <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max={returningItem.quantity || 1}
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(Math.min(returningItem.quantity || 1, Math.max(1, Number(e.target.value))))}
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
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "8px" }}>
                Select Return Condition <span style={{ color: "#f87171" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
                    Restored directly into Available Stock.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReturnCondition("damaged");
                    setDamagedCount(returnQuantity);
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
                    Added to Damaged Stock count.
                  </p>
                </button>
              </div>
            </div>

            {returnCondition === "damaged" && (
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Number of Damaged Units (out of {returnQuantity}) <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={returnQuantity}
                  value={damagedCount}
                  onChange={(e) => setDamagedCount(Math.min(returnQuantity, Math.max(1, Number(e.target.value))))}
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
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Return Notes / Remarks
              </label>
              <textarea
                rows="3"
                placeholder={returnCondition === "damaged" ? "Describe how damage occurred..." : "Optional return remarks..."}
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
              <button
                type="button"
                onClick={() => setReturningItem(null)}
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
                {returnLoading ? "Processing..." : "Confirm Return"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Team;