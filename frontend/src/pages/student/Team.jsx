import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../../services/api";
import {
  UsersRound,
  UserCheck,
  Mail,
  Phone,
  Shield,
  Award,
  RefreshCw,
  Trophy,
  GraduationCap
} from "lucide-react";
import "../../styles/admin.css";

const StudentTeam = () => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/student/team`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setTeamData(res.data.team);
      }
    } catch (err) {
      console.error("Student team fetch error:", err);
      setError(
        err.response?.data?.message || "Failed to load team and squad details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const coach = teamData?.coach;
  const members = teamData?.members || [];

  return (
    <div className="management-page" style={{ padding: "24px", color: "#c9d1d9" }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#f0f6fc", margin: "0 0 6px" }}>
            My Squad & Coach
          </h1>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            Official athlete roster and coach assignment for {teamData?.name || "your sports squad"}.
          </p>
        </div>

        <button
          onClick={fetchTeam}
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

      {/* SQUAD OVERVIEW & COACH PROFILE */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        {/* SQUAD CARD */}
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "20px",
            borderLeft: "4px solid #05c7ee"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <Trophy size={20} color="#05c7ee" />
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#f0f6fc", margin: 0 }}>
              Squad Information
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
              <span style={{ color: "#8da3b5" }}>Team Name:</span>
              <strong style={{ color: "#05c7ee" }}>{teamData?.name || "Official Sports Squad"}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
              <span style={{ color: "#8da3b5" }}>Sport Discipline:</span>
              <strong style={{ color: "#f0f6fc" }}>{teamData?.sport || "Athletics"}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
              <span style={{ color: "#8da3b5" }}>Total Squad Athletes:</span>
              <strong style={{ color: "#34d399" }}>{members.length} Registered</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8da3b5" }}>Department Affiliation:</span>
              <strong style={{ color: "#f0f6fc" }}>BIT Sports Council</strong>
            </div>
          </div>
        </div>

        {/* ASSIGNED COACH CARD */}
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "20px",
            borderLeft: "4px solid #10b981"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <Shield size={20} color="#10b981" />
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#f0f6fc", margin: 0 }}>
              Head Coach Profile
            </h2>
          </div>

          {coach ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
                <span style={{ color: "#8da3b5" }}>Coach Name:</span>
                <strong style={{ color: "#f0f6fc" }}>{coach.name}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
                <span style={{ color: "#8da3b5" }}>Email Address:</span>
                <strong style={{ color: "#c9d1d9" }}>{coach.email || "-"}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
                <span style={{ color: "#8da3b5" }}>Phone Contact:</span>
                <strong style={{ color: "#c9d1d9" }}>{coach.phone || "-"}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8da3b5" }}>Sport Specialty:</span>
                <strong style={{ color: "#10b981" }}>{coach.sport || "Head Coach"}</strong>
              </div>
            </div>
          ) : (
            <div style={{ color: "#8da3b5", fontSize: "13px", padding: "16px 0" }}>
              No coach assigned to this squad yet.
            </div>
          )}
        </div>
      </div>

      {/* SQUAD MEMBERS ROSTER TABLE */}
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "10px",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: "#0d1117",
            borderBottom: "1px solid #21262d",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <UsersRound size={18} color="#05c7ee" />
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#f0f6fc", margin: 0 }}>
              Squad Athletes Roster ({members.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8da3b5" }}>
            <RefreshCw size={24} className="animate-spin" style={{ marginBottom: "8px" }} />
            <p>Loading squad members...</p>
          </div>
        ) : members.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8da3b5" }}>
            <UsersRound size={36} style={{ opacity: 0.3, marginBottom: "10px" }} />
            <p>No teammates registered in this squad yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#0d1117", borderBottom: "1px solid #21262d", color: "#8da3b5" }}>
                  <th style={{ padding: "12px 16px" }}>#</th>
                  <th style={{ padding: "12px 16px" }}>Athlete Name</th>
                  <th style={{ padding: "12px 16px" }}>Athlete ID</th>
                  <th style={{ padding: "12px 16px" }}>Register No.</th>
                  <th style={{ padding: "12px 16px" }}>Department</th>
                  <th style={{ padding: "12px 16px" }}>Year</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => (
                  <tr
                    key={m._id || m.studentId || idx}
                    style={{
                      borderBottom: "1px solid #21262d",
                      transition: "background 0.1s ease"
                    }}
                  >
                    <td style={{ padding: "12px 16px", color: "#8da3b5" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "rgba(5, 199, 238, 0.12)",
                            color: "#05c7ee",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "12px"
                          }}
                        >
                          {m.name ? m.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <strong style={{ color: "#f0f6fc" }}>{m.name}</strong>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#05c7ee", fontWeight: "600" }}>
                      {m.studentId || "-"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#c9d1d9" }}>{m.registerNumber || "-"}</td>
                    <td style={{ padding: "12px 16px", color: "#8da3b5" }}>{m.department || "General"}</td>
                    <td style={{ padding: "12px 16px", color: "#8da3b5" }}>Year {m.year || 1}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(16, 185, 129, 0.15)",
                          color: "#34d399",
                          fontSize: "11px",
                          fontWeight: "700"
                        }}
                      >
                        Active Squad
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
  );
};

export default StudentTeam;
