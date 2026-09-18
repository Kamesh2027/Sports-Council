import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import Modal from "../../components/common/Modal";
import CoachForm from "../../components/common/CoachForm";
import {
  UserRoundCog,
  Plus,
  Search,
  Trash2,
  Phone,
  Mail,
  Trophy,
  Users,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

const Coaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const loadCoaches = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getCoaches();
      setCoaches(data.coaches || []);
    } catch (err) {
      console.error("Failed to load coaches:", err);
      setError(err.response?.data?.message || "Failed to load coaches list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const handleDeleteCoach = async (coach) => {
    if (
      !window.confirm(
        `Are you sure you want to remove Coach ${coach.name} (${coach.userId})? This will also disable their portal access.`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteCoach(coach.userId || coach._id);
      setActionSuccess(`Coach ${coach.name} was removed successfully.`);
      setTimeout(() => setActionSuccess(""), 4000);
      loadCoaches();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete coach.");
    }
  };

  const handleCoachAdded = (newCoach) => {
    setShowModal(false);
    setActionSuccess(`Coach ${newCoach?.name || ""} registered successfully!`);
    setTimeout(() => setActionSuccess(""), 4000);
    loadCoaches();
  };

  // Filter coaches
  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch =
      (coach.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coach.userId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coach.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coach.phone || "").includes(searchQuery) ||
      (coach.sport || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSport =
      selectedSport === "all" ||
      (coach.sport || "").toLowerCase() === selectedSport.toLowerCase();

    return matchesSearch && matchesSport;
  });

  // Sports list for filter
  const sportsList = Array.from(
    new Set(coaches.map((c) => c.sport).filter(Boolean))
  );

  return (
    <div className="management-page">
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, fontSize: "22px" }}>
            <UserRoundCog size={24} color="#05c7ee" />
            Coach Management
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#8da3b5", fontSize: "13px" }}>
            Register, assign, and oversee athletic coaches and sport directors.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
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
          <Plus size={18} />
          ADD COACH
        </button>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
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
          <span>{actionSuccess}</span>
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
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#8da3b5" }}>TOTAL COACHES</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>{coaches.length}</h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5, 199, 238, 0.1)", color: "#05c7ee" }}>
            <UserRoundCog size={24} />
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
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#8da3b5" }}>SPORTS DISCIPLINES</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>{sportsList.length || 1}</h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
            <Trophy size={24} />
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
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#8da3b5" }}>ASSIGNED PLAYERS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>
              {coaches.reduce((acc, c) => acc + (c.studentCount || 0), 0)}
            </h2>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
            <Users size={24} />
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
              placeholder="Search by name, ID, email, or sport..."
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
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
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
            <option value="all">All Sports ({coaches.length})</option>
            {sportsList.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadCoaches}
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
          title="Refresh coach list"
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Coach Table Card */}
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
            Registered Coaches ({filteredCoaches.length})
          </h2>
        </div>

        <div className="management-card-body" style={{ padding: "0" }}>
          {loading ? (
            <div className="empty-state" style={{ padding: "40px" }}>
              <div className="dashboard-loading">Loading coaches...</div>
            </div>
          ) : error ? (
            <div className="empty-state" style={{ padding: "40px" }}>
              <h3 style={{ color: "#f87171" }}>Unable to load coaches</h3>
              <p>{error}</p>
              <button className="primary-btn" onClick={loadCoaches} style={{ marginTop: "12px" }}>
                Try Again
              </button>
            </div>
          ) : filteredCoaches.length === 0 ? (
            <div className="empty-state" style={{ padding: "50px 20px", textAlign: "center" }}>
              <UserRoundCog size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
              <h3>No Coaches Found</h3>
              <p style={{ color: "#8da3b5", maxWidth: "400px", margin: "0 auto 16px auto" }}>
                {searchQuery || selectedSport !== "all"
                  ? "No coaches match your search or filter criteria."
                  : "No sports coaches are currently registered in the system."}
              </p>
              <button
                className="primary-btn"
                onClick={() => setShowModal(true)}
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
                + Register First Coach
              </button>
            </div>
          ) : (
            <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#14181e", textAlign: "left" }}>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>COACH</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>COACH ID</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>CONTACT & EMAIL</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>GENDER</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>SPORT</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>ASSIGNED SQUAD</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>PLAYERS</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoaches.map((coach) => (
                    <tr
                      key={coach._id || coach.userId}
                      style={{
                        borderBottom: "1px solid #21262d",
                        transition: "background-color 0.15s"
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#161b22")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(5, 199, 238, 0.15)",
                              color: "#05c7ee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "14px"
                            }}
                          >
                            {(coach.name || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ color: "#f0f6fc", fontSize: "13px", display: "block" }}>
                              {coach.name}
                            </strong>
                            <span style={{ fontSize: "11px", color: "#8b949e" }}>
                              Coach Profile
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Coach ID */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
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
                          {coach.userId}
                        </span>
                      </td>

                      {/* Contact & Email */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <span style={{ color: "#c9d1d9", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Mail size={12} color="#8da3b5" />
                            {coach.email}
                          </span>
                          {coach.phone && (
                            <span style={{ color: "#8da3b5", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Phone size={12} color="#8da3b5" />
                              {coach.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Gender */}
                      <td style={{ padding: "14px 16px" , textAlign: "center" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor:
                              coach.gender === "Female"
                                ? "rgba(244, 114, 182, 0.15)"
                                : "rgba(96, 165, 250, 0.15)",
                            color: coach.gender === "Female" ? "#f472b6" : "#60a5fa"
                          }}
                        >
                          {coach.gender || "Male"}
                        </span>
                      </td>

                      {/* Sport */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            backgroundColor: "rgba(234, 179, 8, 0.15)",
                            border: "1px solid rgba(234, 179, 8, 0.3)",
                            borderRadius: "4px",
                            color: "#facc15",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          {coach.sport || "General"}
                        </span>
                      </td>

                      {/* Assigned Squad */}
                      <td style={{ padding: "14px 16px", color: "#c9d1d9", fontSize: "12px" , textAlign: "center" }}>
                        {coach.teamName || `${coach.sport} Team`}
                      </td>

                      {/* Players Count */}
                      <td style={{ padding: "14px 16px" , textAlign: "center" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(34, 197, 94, 0.15)",
                            color: "#4ade80",
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          {coach.studentCount || 0} Athletes
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <button
                          onClick={() => handleDeleteCoach(coach)}
                          title="Remove Coach"
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "6px",
                            color: "#f87171",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <Trash2 size={14} />
                          Remove
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

      {/* Add Coach Modal */}
      {showModal && (
        <Modal
          title="Register New Sports Coach"
          onClose={() => setShowModal(false)}
          maxWidth="560px"
        >
          <CoachForm
            onSuccess={handleCoachAdded}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Coaches;