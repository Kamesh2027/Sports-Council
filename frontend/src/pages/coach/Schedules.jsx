import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../services/api";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  RefreshCw,
  Search,
  CheckCircle2,
  Activity,
  Award
} from "lucide-react";

const CoachSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/coach/schedules`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error("Failed to load coach schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.tournamentName && s.tournamentName.toLowerCase().includes(q)) ||
      (s.team1Name && s.team1Name.toLowerCase().includes(q)) ||
      (s.team2Name && s.team2Name.toLowerCase().includes(q)) ||
      (s.venue && s.venue.toLowerCase().includes(q))
    );
  });

  const renderStatusBadge = (status) => {
    const s = (status || "scheduled").toLowerCase();
    switch (s) {
      case "in-progress":
      case "ongoing":
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: "11px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                display: "inline-block"
              }}
            />
            LIVE NOW
          </span>
        );
      case "completed":
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#60a5fa",
              fontSize: "11px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <CheckCircle2 size={12} />
            COMPLETED
          </span>
        );
      case "postponed":
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#fbbf24",
              fontSize: "11px",
              fontWeight: "700"
            }}
          >
            POSTPONED
          </span>
        );
      case "cancelled":
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "11px",
              fontWeight: "700"
            }}
          >
            CANCELLED
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: "rgba(5, 199, 238, 0.12)",
              border: "1px solid rgba(5, 199, 238, 0.3)",
              color: "#05c7ee",
              fontSize: "11px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Clock size={12} />
            SCHEDULED
          </span>
        );
    }
  };

  return (
    <div className="management-page" style={{ padding: "24px", color: "#c9d1d9" }}>
      {/* PAGE HEADER */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#f0f6fc", margin: 0 }}>
            Team Match Schedules & Fixtures
          </h1>
          <p style={{ color: "#8b949e", marginTop: "4px", fontSize: "14px" }}>
            Track your squad's upcoming tournament matches, venues, timings, and results.
          </p>
        </div>

        <button
          onClick={loadSchedules}
          style={{
            padding: "9px 14px",
            backgroundColor: "#21262d",
            border: "1px solid #30363d",
            borderRadius: "8px",
            color: "#c9d1d9",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* FILTER BAR */}
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "10px",
          padding: "14px 16px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8b949e"
            }}
          />
          <input
            type="text"
            placeholder="Search fixtures by opponent, tournament, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#c9d1d9",
              fontSize: "13px",
              outline: "none"
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#c9d1d9",
            fontSize: "13px",
            outline: "none"
          }}
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">Live / Ongoing</option>
          <option value="completed">Completed</option>
          <option value="postponed">Postponed</option>
        </select>
      </div>

      {/* FIXTURES LIST / CARDS */}
      {loading ? (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "40px",
            textAlign: "center"
          }}
        >
          <RefreshCw size={24} className="animate-spin" style={{ color: "#05c7ee", marginBottom: "10px" }} />
          <p style={{ color: "#8b949e", margin: 0 }}>Loading team fixtures...</p>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "50px 20px",
            textAlign: "center"
          }}
        >
          <Calendar size={40} style={{ color: "#8b949e", opacity: 0.3, marginBottom: "12px" }} />
          <h3 style={{ color: "#f0f6fc", fontSize: "16px", margin: "0 0 6px 0" }}>No Match Schedules Found</h3>
          <p style={{ color: "#8b949e", fontSize: "13px", margin: 0 }}>
            No match fixtures have been scheduled for your sport or team yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "16px"
          }}
        >
          {filteredSchedules.map((schedule) => (
            <div
              key={schedule._id}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "10px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
              }}
            >
              {/* TOP HEADER */}
              <div
                style={{
                  padding: "10px 14px",
                  background: "#0d1117",
                  borderBottom: "1px solid #21262d",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Trophy size={14} color="#05c7ee" />
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#05c7ee" }}>
                    {schedule.tournamentName || "Tournament"}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "#21262d",
                      color: "#8b949e",
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}
                  >
                    {schedule.round || "Match"}
                  </span>
                </div>
                {renderStatusBadge(schedule.status)}
              </div>

              {/* CARD BODY */}
              <div style={{ padding: "14px", flex: 1 }}>
                <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#f0f6fc", margin: "0 0 12px 0" }}>
                  {schedule.title}
                </h3>

                {/* TEAMS BOX */}
                <div
                  style={{
                    background: "#0d1117",
                    border: "1px solid #21262d",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    marginBottom: "12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <strong style={{ fontSize: "13px", color: "#f0f6fc" }}>
                      🛡️ {schedule.team1Name || schedule.team1Id?.name || "Team 1"}
                    </strong>
                    {schedule.winnerTeamId &&
                      String(schedule.winnerTeamId._id || schedule.winnerTeamId) === String(schedule.team1Id?._id || schedule.team1Id) && (
                        <span style={{ fontSize: "10px", color: "#fbbf24", fontWeight: "700" }}>👑 WINNER</span>
                      )}
                  </div>

                  <div style={{ textAlign: "center", color: "#8b949e", fontSize: "11px", fontWeight: "700", margin: "2px 0" }}>
                    VS
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <strong style={{ fontSize: "13px", color: "#f0f6fc" }}>
                      ⚔️ {schedule.team2Name || schedule.team2Id?.name || schedule.opponent || "Opponent"}
                    </strong>
                    {schedule.winnerTeamId &&
                      String(schedule.winnerTeamId._id || schedule.winnerTeamId) === String(schedule.team2Id?._id || schedule.team2Id) && (
                        <span style={{ fontSize: "10px", color: "#fbbf24", fontWeight: "700" }}>👑 WINNER</span>
                      )}
                  </div>

                  {schedule.score && (
                    <div
                      style={{
                        marginTop: "6px",
                        padding: "4px 8px",
                        background: "#161b22",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#34d399",
                        fontWeight: "700",
                        textAlign: "center"
                      }}
                    >
                      Result: {schedule.score}
                    </div>
                  )}
                </div>

                {/* MATCH INFO */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "#8b949e" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={13} color="#05c7ee" />
                    <span style={{ color: "#c9d1d9", fontWeight: "600" }}>
                      {schedule.date ? new Date(schedule.date).toLocaleDateString() : "-"}
                    </span>
                    <span>•</span>
                    <Clock size={13} color="#f59e0b" />
                    <span style={{ color: "#c9d1d9" }}>
                      {schedule.startTime && schedule.endTime
                        ? `${schedule.startTime} - ${schedule.endTime}`
                        : schedule.time || "-"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={13} color="#10b981" />
                    <span style={{ color: "#f0f6fc", fontWeight: "600" }}>{schedule.venue}</span>
                  </div>

                  {schedule.referee && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Award size={13} color="#a78bfa" />
                      <span>Referee: {schedule.referee}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoachSchedules;