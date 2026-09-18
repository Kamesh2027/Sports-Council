import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  UsersRound,
  Dumbbell,
  ClipboardList,
  CalendarDays,
  Trophy,
  UserRound,
  ShieldCheck,
  MapPin,
  Clock,
  RefreshCw,
  Plus,
  ArrowRight,
  Award,
  Sparkles
} from "lucide-react";
import "../../styles/admin.css";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const hostname = window.location.hostname || "localhost";
  const API_BASE = `http://${hostname}:5000/api`;

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/student/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error("Student dashboard error:", err);
      setError(
        err.response?.data?.message || "Unable to load student athlete dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const student = dashboardData?.student || {
    name: user?.name || "Student Athlete",
    studentId: user?.userId || "STUDENT",
    email: user?.email || "",
    department: "General",
    year: 1,
    registerNumber: "-"
  };
  const coach = dashboardData?.coach;
  const team = dashboardData?.team;
  const sport = dashboardData?.sport || coach?.sport || "Athletics";
  const stats = dashboardData?.stats || {
    equipmentIssuedCount: 0,
    pendingRequestsCount: 0,
    upcomingMatchesCount: 0,
    tournamentsCount: 0
  };
  const issuedEquipment = dashboardData?.issuedEquipment || [];
  const equipmentRequests = dashboardData?.equipmentRequests || [];
  const tournaments = dashboardData?.tournaments || [];
  const schedules = dashboardData?.schedules || [];

  return (
    <div className="management-page" style={{ padding: "24px", color: "#c9d1d9" }}>
      {/* TOP ATHLETE GREETING BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #161b22 0%, #0d1117 100%)",
          border: "1px solid #30363d",
          borderRadius: "12px",
          padding: "22px 26px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(5, 199, 238, 0.2) 0%, rgba(5, 199, 238, 0.05) 100%)",
              border: "1.5px solid #05c7ee",
              color: "#05c7ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "800",
              boxShadow: "0 0 15px rgba(5, 199, 238, 0.25)"
            }}
          >
            {student.name ? student.name.charAt(0).toUpperCase() : "A"}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f0f6fc", margin: 0 }}>
                Welcome back, {student.name}!
              </h1>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#34d399",
                  fontSize: "11px",
                  fontWeight: "700"
                }}
              >
                ✓ Registered Athlete
              </span>
            </div>
            <p style={{ color: "#8b949e", margin: "6px 0 0", fontSize: "13px" }}>
              Athlete ID: <strong style={{ color: "#05c7ee" }}>{student.studentId}</strong> • Sport:{" "}
              <strong style={{ color: "#f0f6fc" }}>{sport}</strong> • Team:{" "}
              <strong style={{ color: "#f0f6fc" }}>{team?.name || coach?.teamName || `${sport} Squad`}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={fetchDashboard}
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

      {/* 4 STAT METRIC CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        {/* SQUAD MEMBERS */}
        <div
          onClick={() => navigate("/student/team")}
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "18px",
            borderLeft: "4px solid #05c7ee",
            cursor: "pointer",
            transition: "transform 0.15s ease, border-color 0.15s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b949e", fontSize: "12px", fontWeight: "700" }}>
            <span>MY SQUAD</span>
            <UsersRound size={18} color="#05c7ee" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#f0f6fc", marginTop: "10px" }}>
            {team?.memberCount || team?.members?.length || 1}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Active Squad Athletes</div>
        </div>

        {/* UPCOMING MATCHES */}
        <div
          onClick={() => navigate("/student/schedules")}
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "18px",
            borderLeft: "4px solid #f59e0b",
            cursor: "pointer",
            transition: "transform 0.15s ease, border-color 0.15s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b949e", fontSize: "12px", fontWeight: "700" }}>
            <span>MATCH FIXTURES</span>
            <CalendarDays size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#fbbf24", marginTop: "10px" }}>
            {stats.upcomingMatchesCount || schedules.length}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Scheduled Matches</div>
        </div>

        {/* EQUIPMENT ISSUED */}
        <div
          onClick={() => navigate("/student/requests")}
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "18px",
            borderLeft: "4px solid #10b981",
            cursor: "pointer",
            transition: "transform 0.15s ease, border-color 0.15s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b949e", fontSize: "12px", fontWeight: "700" }}>
            <span>GEAR IN HAND</span>
            <Dumbbell size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#34d399", marginTop: "10px" }}>
            {stats.equipmentIssuedCount || issuedEquipment.length}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Issued Items on Loan</div>
        </div>

        {/* ACTIVE TOURNAMENTS */}
        <div
          onClick={() => navigate("/student/tournaments")}
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "18px",
            borderLeft: "4px solid #3b82f6",
            cursor: "pointer",
            transition: "transform 0.15s ease, border-color 0.15s ease"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b949e", fontSize: "12px", fontWeight: "700" }}>
            <span>TOURNAMENTS</span>
            <Trophy size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#60a5fa", marginTop: "10px" }}>
            {stats.tournamentsCount || tournaments.length}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Open Tournaments</div>
        </div>
      </div>

      {/* DASHBOARD PANELS (2x2 GRID - NO RECENT ACTIVITIES) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "20px" }}>
        {/* 1. COACH & SQUAD SUMMARY */}
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
              padding: "14px 18px",
              background: "#0d1117",
              borderBottom: "1px solid #21262d",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UsersRound size={16} color="#05c7ee" />
              <strong style={{ fontSize: "14px", color: "#f0f6fc" }}>Coach & Squad Details</strong>
            </div>
            <button
              onClick={() => navigate("/student/team")}
              style={{
                background: "none",
                border: "none",
                color: "#05c7ee",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              View Squad <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "10px" }}>
              <span style={{ color: "#8da3b5", fontSize: "13px" }}>Assigned Coach:</span>
              <strong style={{ color: "#f0f6fc", fontSize: "13px" }}>{coach?.name || "Sports Coach"}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "10px" }}>
              <span style={{ color: "#8da3b5", fontSize: "13px" }}>Coach Contact:</span>
              <strong style={{ color: "#c9d1d9", fontSize: "13px" }}>{coach?.email || coach?.phone || "-"}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "10px" }}>
              <span style={{ color: "#8da3b5", fontSize: "13px" }}>Team / Squad:</span>
              <strong style={{ color: "#05c7ee", fontSize: "13px" }}>
                {team?.name || coach?.teamName || `${sport} Squad`}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8da3b5", fontSize: "13px" }}>Sports Discipline:</span>
              <strong style={{ color: "#f0f6fc", fontSize: "13px" }}>{sport}</strong>
            </div>
          </div>
        </div>

        {/* 2. UPCOMING MATCHES PREVIEW */}
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
              padding: "14px 18px",
              background: "#0d1117",
              borderBottom: "1px solid #21262d",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarDays size={16} color="#f59e0b" />
              <strong style={{ fontSize: "14px", color: "#f0f6fc" }}>Upcoming Match Fixtures</strong>
            </div>
            <button
              onClick={() => navigate("/student/schedules")}
              style={{
                background: "none",
                border: "none",
                color: "#05c7ee",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              All Fixtures <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: "16px" }}>
            {schedules.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 10px", color: "#8da3b5", fontSize: "13px" }}>
                No upcoming matches scheduled right now.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {schedules.slice(0, 3).map((m, idx) => (
                  <div
                    key={m._id || idx}
                    style={{
                      background: "#0d1117",
                      border: "1px solid #21262d",
                      borderRadius: "8px",
                      padding: "12px 14px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "13px", color: "#f0f6fc" }}>{m.title}</strong>
                      <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "rgba(5, 199, 238, 0.12)", color: "#05c7ee", fontWeight: "700" }}>
                        {m.round || "Fixture"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#8da3b5", display: "flex", gap: "14px" }}>
                      <span>📅 {m.date ? new Date(m.date).toLocaleDateString() : "TBA"}</span>
                      <span>🏟️ {m.venue || "Campus Ground"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. TOURNAMENTS OVERVIEW */}
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
              padding: "14px 18px",
              background: "#0d1117",
              borderBottom: "1px solid #21262d",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Trophy size={16} color="#3b82f6" />
              <strong style={{ fontSize: "14px", color: "#f0f6fc" }}>Active Tournaments</strong>
            </div>
            <button
              onClick={() => navigate("/student/tournaments")}
              style={{
                background: "none",
                border: "none",
                color: "#05c7ee",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              Browse All <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: "16px" }}>
            {tournaments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 10px", color: "#8da3b5", fontSize: "13px" }}>
                No active tournaments listed at this time.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {tournaments.slice(0, 3).map((t, idx) => (
                  <div
                    key={t._id || idx}
                    style={{
                      background: "#0d1117",
                      border: "1px solid #21262d",
                      borderRadius: "8px",
                      padding: "12px 14px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "13px", color: "#f0f6fc" }}>{t.name}</strong>
                      <span style={{ fontSize: "11px", color: "#05c7ee", fontWeight: "700" }}>{t.sport}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#8da3b5" }}>
                      📍 {t.venue} • {t.startDate ? new Date(t.startDate).toLocaleDateString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. GEAR & REQUESTS STATUS */}
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
              padding: "14px 18px",
              background: "#0d1117",
              borderBottom: "1px solid #21262d",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Dumbbell size={16} color="#10b981" />
              <strong style={{ fontSize: "14px", color: "#f0f6fc" }}>Equipment & Requests</strong>
            </div>
            <button
              onClick={() => navigate("/student/requests")}
              style={{
                background: "none",
                border: "none",
                color: "#05c7ee",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              My Requests <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ padding: "16px" }}>
            {issuedEquipment.length === 0 && equipmentRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <p style={{ color: "#8da3b5", fontSize: "13px", margin: "0 0 12px" }}>
                  No active equipment requests. Need gear for your training?
                </p>
                <button
                  onClick={() => navigate("/student/equipment")}
                  style={{
                    padding: "7px 14px",
                    backgroundColor: "#05c7ee",
                    border: "none",
                    borderRadius: "6px",
                    color: "#07131a",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Request Equipment
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {issuedEquipment.slice(0, 2).map((req, idx) => (
                  <div
                    key={req._id || idx}
                    style={{
                      background: "#0d1117",
                      border: "1px solid #21262d",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "13px", color: "#f0f6fc", display: "block" }}>
                        {req.equipmentId?.name || "Sports Equipment"}
                      </strong>
                      <span style={{ fontSize: "11px", color: "#8da3b5" }}>
                        Qty: {req.quantity || 1} • Issued for training
                      </span>
                    </div>
                    <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontWeight: "700" }}>
                      ISSUED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;