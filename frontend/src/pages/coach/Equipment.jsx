import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../components/common/Modal";
import {
  Package,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Users,
  Trophy,
  Wrench,
  Clock,
  Layers
} from "lucide-react";

const CoachEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [team, setTeam] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("squad"); // "squad" | "inventory" | "returns"

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnTarget, setSelectedReturnTarget] = useState(null); // loan object or team equipment item
  const [returnSourceType, setReturnSourceType] = useState("loan"); // "loan" | "team_gear" | "custom"
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnCondition, setReturnCondition] = useState("good"); // "good" | "damaged"
  const [damagedCount, setDamagedCount] = useState(0);
  const [returnRemarks, setReturnRemarks] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadEquipmentData();
  }, []);

  const loadEquipmentData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/coach/equipment", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEquipment(res.data.equipment || []);
      setTeam(res.data.team || null);
      setActiveLoans(res.data.activeLoans || []);
      setStudents(res.data.students || []);
    } catch (error) {
      console.error("Failed to load coach equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open Return Modal for a specific loan
  const handleOpenReturnLoan = (loan) => {
    setSelectedReturnTarget(loan);
    setReturnSourceType("loan");
    setSelectedEquipmentId(loan.equipmentId?._id || loan.equipmentId);
    setSelectedStudentId(loan.studentId?._id || "");
    setReturnQuantity(loan.quantity || 1);
    setReturnCondition("good");
    setDamagedCount(0);
    setReturnRemarks("");
    setReturnError("");
    setShowReturnModal(true);
  };

  // Open Return Modal for team gear
  const handleOpenReturnTeamGear = (teamGearItem) => {
    setSelectedReturnTarget(teamGearItem);
    setReturnSourceType("team_gear");
    setSelectedEquipmentId(teamGearItem.equipmentId?._id || teamGearItem.equipmentId || teamGearItem._id);
    setSelectedStudentId("");
    setReturnQuantity(teamGearItem.quantity || 1);
    setReturnCondition("good");
    setDamagedCount(0);
    setReturnRemarks("");
    setReturnError("");
    setShowReturnModal(true);
  };

  // Open General Return Modal
  const handleOpenGeneralReturn = () => {
    setSelectedReturnTarget(null);
    setReturnSourceType(activeLoans.filter((l) => l.status === "approved").length > 0 ? "loan" : "team_gear");
    setSelectedEquipmentId(equipment.length > 0 ? equipment[0]._id : "");
    setSelectedStudentId("");
    setReturnQuantity(1);
    setReturnCondition("good");
    setDamagedCount(0);
    setReturnRemarks("");
    setReturnError("");
    setShowReturnModal(true);
  };

  // Submit Return
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnError("");

    if (returnQuantity < 1) {
      setReturnError("Quantity must be at least 1.");
      return;
    }

    setReturnLoading(true);

    try {
      const isDamaged = returnCondition === "damaged";
      const finalDamagedCount = isDamaged ? Math.min(returnQuantity, Math.max(1, Number(damagedCount) || returnQuantity)) : 0;

      const payload = {
        requestId: returnSourceType === "loan" && selectedReturnTarget ? selectedReturnTarget._id || selectedReturnTarget.requestId : null,
        equipmentId: selectedEquipmentId || (selectedReturnTarget?.equipmentId?._id || selectedReturnTarget?.equipmentId),
        studentId: selectedStudentId || selectedReturnTarget?.studentId?._id || null,
        quantity: Number(returnQuantity),
        condition: returnCondition,
        damagedCount: finalDamagedCount,
        remarks: returnRemarks.trim() || (isDamaged ? `Returned with ${finalDamagedCount} damaged units while playing.` : "Returned in good condition.")
      };

      const res = await axios.post(
        "http://localhost:5000/api/coach/equipment/return",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification(res.data.message || "Equipment return processed successfully! Stock updated immediately.");
      setShowReturnModal(false);
      setTimeout(() => setNotification(""), 5000);
      loadEquipmentData();
    } catch (err) {
      console.error("Return error:", err);
      setReturnError(err.response?.data?.message || "Failed to process equipment return.");
    } finally {
      setReturnLoading(false);
    }
  };

  const teamEquipments = team?.equipments || [];
  const activeApprovedLoans = activeLoans.filter((l) => l.status === "approved");
  const returnedLoans = activeLoans.filter((l) => l.status === "returned");

  // Calculations
  const totalAllocatedGear = teamEquipments.reduce((acc, eq) => acc + (eq.quantity || 0), 0);
  const totalActiveLoanUnits = activeApprovedLoans.reduce((acc, l) => acc + (l.quantity || 0), 0);

  // Filtering
  const filteredEquipment = equipment.filter((eq) =>
    (eq.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (eq.sport || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (eq.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Package size={24} color="#05c7ee" />
            Sports Equipment & Gear Management
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#8da3b5", fontSize: "13px" }}>
            View squad equipment, monitor athlete loans, track inventory, and return gear (normal or damaged while playing).
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="primary-btn"
            onClick={handleOpenGeneralReturn}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#05c7ee",
              color: "#07131a",
              fontWeight: "700",
              padding: "10px 18px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            <RotateCcw size={18} />
            RETURN EQUIPMENT
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
        {/* Squad Allocated Units */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>SQUAD ALLOCATED GEAR</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#05c7ee" }}>{totalAllocatedGear}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>{teamEquipments.length} gear types assigned</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5, 199, 238, 0.1)", color: "#05c7ee" }}>
            <Trophy size={24} />
          </div>
        </div>

        {/* Active Athlete Loans */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>ACTIVE ATHLETE LOANS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#4ade80" }}>{activeApprovedLoans.length}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>{totalActiveLoanUnits} units in use</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Returned Items */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>PROCESSED RETURNS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#38bdf8" }}>{returnedLoans.length}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Returned to council storage</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.1)", color: "#38bdf8" }}>
            <RotateCcw size={24} />
          </div>
        </div>

        {/* Available in Inventory */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>TOTAL STOCK AVAILABLE</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>
              {equipment.reduce((acc, eq) => acc + (eq.availableQuantity || 0), 0)}
            </h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>{equipment.length} items listed</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
            <Layers size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          onClick={() => setActiveTab("squad")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "squad" ? "#05c7ee" : "#161b22",
            color: activeTab === "squad" ? "#07131a" : "#c9d1d9",
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
          <Trophy size={16} />
          Squad Gear & Active Athlete Loans ({teamEquipments.length + activeApprovedLoans.length})
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "inventory" ? "#05c7ee" : "#161b22",
            color: activeTab === "inventory" ? "#07131a" : "#c9d1d9",
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
          General Equipment Inventory ({equipment.length})
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "returns" ? "#05c7ee" : "#161b22",
            color: activeTab === "returns" ? "#07131a" : "#c9d1d9",
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
          <RotateCcw size={16} />
          Processed Returns History ({returnedLoans.length})
        </button>
      </div>

      {/* TAB 1: SQUAD GEAR & ACTIVE ATHLETE LOANS */}
      {activeTab === "squad" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Section A: Team Allocated Equipment */}
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
                <h2 style={{ margin: 0, fontSize: "16px", color: "#f0f6fc", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Trophy size={18} color="#05c7ee" />
                  Squad Allocated Equipment & Gear ({teamEquipments.length})
                </h2>
                <span style={{ fontSize: "12px", color: "#8da3b5" }}>
                  Assigned directly to '{team?.name || "Your Squad"}'
                </span>
              </div>
            </div>

            <div className="management-card-body" style={{ padding: "0" }}>
              {teamEquipments.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 20px", textAlign: "center" }}>
                  <Package size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
                  <h3 style={{ fontSize: "15px" }}>No Squad Equipment Allocated</h3>
                  <p style={{ color: "#8da3b5", fontSize: "12px" }}>
                    Gear allocated directly to your squad by administration will appear here.
                  </p>
                </div>
              ) : (
                <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
                  <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#14181e", textAlign: "left" }}>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>EQUIPMENT ITEM</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>CATEGORY</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>ALLOCATED QTY</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>STATUS</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a", textAlign: "right" }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamEquipments.map((item, idx) => {
                        const eqDetails = item.equipmentId || {};
                        return (
                          <tr
                            key={item._id || eqDetails._id || idx}
                            style={{ borderBottom: "1px solid #21262d" }}
                          >
                            <td style={{ padding: "14px 16px" }}>
                              <strong style={{ color: "#f0f6fc", fontSize: "13px" }}>
                                {item.name || eqDetails.name || "Sports Gear"}
                              </strong>
                            </td>
                            <td style={{ padding: "14px 16px", color: "#8da3b5", fontSize: "12px" }}>
                              {eqDetails.category || "General Gear"}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
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
                                {item.quantity || 0} Units
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span className="status-badge success">In Squad Possession</span>
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "right" }}>
                              <button
                                onClick={() => handleOpenReturnTeamGear(item)}
                                style={{
                                  padding: "7px 14px",
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

          {/* Section B: Active Athlete Equipment Loans */}
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
                <h2 style={{ margin: 0, fontSize: "16px", color: "#f0f6fc", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={18} color="#05c7ee" />
                  Active Athlete Equipment Loans ({activeApprovedLoans.length})
                </h2>
                <span style={{ fontSize: "12px", color: "#8da3b5" }}>
                  Equipment currently issued to your squad athletes
                </span>
              </div>
            </div>

            <div className="management-card-body" style={{ padding: "0" }}>
              {activeApprovedLoans.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 20px", textAlign: "center" }}>
                  <CheckCircle2 size={40} style={{ opacity: 0.3, color: "#4ade80", marginBottom: "8px" }} />
                  <h3 style={{ fontSize: "15px" }}>No Active Athlete Loans</h3>
                  <p style={{ color: "#8da3b5", fontSize: "12px" }}>
                    No athletes currently have pending active equipment loans requiring return.
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
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>QTY</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>DUE DATE</th>
                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a", textAlign: "right" }}>COACH ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeApprovedLoans.map((loan) => (
                        <tr key={loan._id || loan.requestId} style={{ borderBottom: "1px solid #21262d" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                padding: "2px 6px",
                                backgroundColor: "rgba(56, 189, 248, 0.1)",
                                borderRadius: "4px",
                                color: "#38bdf8",
                                fontFamily: "monospace",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              {loan.requestId}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <strong style={{ color: "#f0f6fc", fontSize: "13px", display: "block" }}>
                              {loan.equipmentId?.name || "Equipment"}
                            </strong>
                            <span style={{ fontSize: "11px", color: "#8da3b5" }}>
                              {loan.equipmentId?.sport} • {loan.equipmentId?.category}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <strong style={{ color: "#f0f6fc", fontSize: "13px", display: "block" }}>
                              {loan.studentId?.name || "Squad Member"}
                            </strong>
                            <span style={{ fontSize: "11px", color: "#8da3b5" }}>
                              {loan.studentId?.studentId || loan.studentId?.registerNumber}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ color: "#f0f6fc", fontWeight: "700", fontSize: "13px" }}>
                              {loan.quantity || 1} Units
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", color: "#8da3b5", fontSize: "12px" }}>
                            {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "-"}
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            <button
                              onClick={() => handleOpenReturnLoan(loan)}
                              style={{
                                padding: "7px 14px",
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL EQUIPMENT INVENTORY */}
      {activeTab === "inventory" && (
        <div className="management-card" style={{ padding: "0", overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #2b323a",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <h2 style={{ margin: 0, fontSize: "16px", color: "#f0f6fc" }}>
              General Sports Inventory ({filteredEquipment.length})
            </h2>

            <div style={{ position: "relative", width: "100%", maxWidth: "280px" }}>
              <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6e7681" }} />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px 6px 32px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "12px"
                }}
              />
            </div>
          </div>

          <div className="management-card-body" style={{ padding: "0" }}>
            {filteredEquipment.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px" }}>
                <h3>No Equipment Found</h3>
              </div>
            ) : (
              <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#14181e", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>EQUIPMENT</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>SPORT & CATEGORY</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>TOTAL UNITS</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>AVAILABLE STOCK</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>DAMAGED</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.map((item) => (
                      <tr key={item._id} style={{ borderBottom: "1px solid #21262d" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <strong style={{ color: "#f0f6fc", fontSize: "13px" }}>{item.name}</strong>
                          <span style={{ fontSize: "11px", color: "#8b949e", display: "block" }}>ID: {item.equipmentId}</span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#8da3b5", fontSize: "12px" }}>
                          {item.sport} • {item.category}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#f0f6fc", fontWeight: "700" }}>{item.totalQuantity || 0}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "10px",
                              backgroundColor: (item.availableQuantity || 0) > 0 ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                              color: (item.availableQuantity || 0) > 0 ? "#4ade80" : "#f87171",
                              fontWeight: "700",
                              fontSize: "12px"
                            }}
                          >
                            {item.availableQuantity ?? 0} Units
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", color: (item.damagedQuantity || 0) > 0 ? "#f87171" : "#6e7681", fontSize: "12px" }}>
                          {item.damagedQuantity || 0}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span className={`status-badge ${item.status === "available" ? "success" : item.status === "maintenance" ? "warning" : "danger"}`}>
                            {item.status || "available"}
                          </span>
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

      {/* TAB 3: PROCESSED RETURNS HISTORY */}
      {activeTab === "returns" && (
        <div className="management-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #2b323a" }}>
            <h2 style={{ margin: 0, fontSize: "16px", color: "#f0f6fc" }}>
              Equipment Returns Record ({returnedLoans.length})
            </h2>
            <span style={{ fontSize: "12px", color: "#8da3b5" }}>
              Log of equipment successfully returned to council storage with damage tracking
            </span>
          </div>

          <div className="management-card-body" style={{ padding: "0" }}>
            {returnedLoans.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px" }}>
                <RotateCcw size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
                <h3>No Return Records Found</h3>
                <p style={{ color: "#8da3b5", fontSize: "12px" }}>
                  Equipment returns submitted by you will appear here with condition reports.
                </p>
              </div>
            ) : (
              <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#14181e", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>REQ ID</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>EQUIPMENT</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>RETURN CONDITION</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>STOCK BREAKDOWN</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>RETURN DATE</th>
                      <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>REMARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedLoans.map((ret) => {
                      const isDamaged = ret.returnCondition === "damaged" || (ret.damagedQuantityReturned || 0) > 0;
                      return (
                        <tr key={ret._id || ret.requestId} style={{ borderBottom: "1px solid #21262d" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ fontFamily: "monospace", color: "#38bdf8", fontSize: "12px", fontWeight: "700" }}>
                              {ret.requestId}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <strong style={{ color: "#f0f6fc", fontSize: "13px" }}>{ret.equipmentId?.name || "Equipment"}</strong>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "600",
                                backgroundColor: isDamaged ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                                color: isDamaged ? "#f87171" : "#4ade80",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              {isDamaged ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                              {isDamaged ? `Damaged (${ret.damagedQuantityReturned || 1} units)` : "Normal (Good Condition)"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "12px" }}>
                            <span style={{ color: "#4ade80" }}>+{ret.goodQuantityReturned ?? (ret.returnCondition === "good" ? ret.quantity : 0)} Available</span>
                            {" • "}
                            <span style={{ color: "#f87171" }}>+{ret.damagedQuantityReturned || 0} Damaged</span>
                          </td>
                          <td style={{ padding: "14px 16px", color: "#8da3b5", fontSize: "12px" }}>
                            {ret.returnDate ? new Date(ret.returnDate).toLocaleDateString() : "-"}
                          </td>
                          <td style={{ padding: "14px 16px", color: "#c9d1d9", fontSize: "12px" }}>
                            {ret.returnRemarks || "-"}
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
      )}

      {/* RETURN EQUIPMENT MODAL */}
      {showReturnModal && (
        <Modal
          title="Return Equipment to Sports Council"
          onClose={() => setShowReturnModal(false)}
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

            {/* If opening from a specific target vs general */}
            {selectedReturnTarget ? (
              <div style={{ padding: "12px", backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5", textTransform: "uppercase" }}>Returning Item:</span>
                <h4 style={{ margin: "4px 0 2px 0", color: "#f0f6fc", fontSize: "15px" }}>
                  {selectedReturnTarget.equipmentId?.name || selectedReturnTarget.name || "Sports Equipment"}
                </h4>
                {selectedReturnTarget.studentId && (
                  <span style={{ fontSize: "12px", color: "#38bdf8" }}>
                    Athlete: {selectedReturnTarget.studentId.name} ({selectedReturnTarget.studentId.studentId || selectedReturnTarget.studentId.registerNumber})
                  </span>
                )}
              </div>
            ) : (
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Select Equipment Item to Return <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  value={selectedEquipmentId}
                  onChange={(e) => setSelectedEquipmentId(e.target.value)}
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
                  {equipment.map((eq) => (
                    <option key={eq._id} value={eq._id}>
                      {eq.name} ({eq.sport})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Quantity to Return <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max={selectedReturnTarget?.quantity || 100}
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(Math.max(1, Number(e.target.value)))}
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
                    Gear is intact $\rightarrow$ added back to Available Stock.
                  </p>
                </button>

                {/* Damaged while playing */}
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
                    Gear damaged in play $\rightarrow$ added to Damaged Stock.
                  </p>
                </button>
              </div>
            </div>

            {/* Damaged Count input if damaged condition */}
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
                <div style={{ fontSize: "11px", color: "#8da3b5", marginTop: "4px" }}>
                  {returnQuantity - damagedCount > 0 && `Remaining ${returnQuantity - damagedCount} units will be returned to Available Stock.`}
                </div>
              </div>
            )}

            {/* Remarks / Incident notes */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Return Notes / Damage Remarks
              </label>
              <textarea
                rows="3"
                placeholder={returnCondition === "damaged" ? "Describe how damage occurred (e.g., Football torn during match, Bat handle cracked...)" : "Optional return notes..."}
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

            {/* Automatic Notice */}
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
                Available counts update immediately upon return. No administrative approval required.
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
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

export default CoachEquipment;