import { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  RefreshCw,
  Search,
  CheckCircle2,
  Activity
} from "lucide-react";

export default function StudentSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");
  const hostname = window.location.hostname || "localhost";

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://${hostname}:5000/api/student/schedules`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error("Failed to load student schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = schedules.filter((s) => {
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

  return (
    <div style={{ minHeight: "100vh", background: "#0c1015", color: "#e5e7eb", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#f0f6fc", margin: 0 }}>
            Upcoming Matches & Fixtures
          </h1>
          <p style={{ color: "#8b949e", marginTop: "4px", fontSize: "14px" }}>
            View your sports matches, tournament fixtures, and scheduled slots.
          </p>
        </div>
        <button
          onClick={loadSchedules}
          style={{
            padding: "8px 14px",
            backgroundColor: "#21262d",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#c9d1d9",
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

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search matches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "8px 12px",
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#c9d1d9",
            fontSize: "13px"
          }}
        />
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#8b949e" }}>
          <RefreshCw size={24} className="animate-spin" style={{ color: "#05c7ee", marginBottom: "10px" }} />
          <p>Loading fixtures...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "50px", textAlign: "center", background: "#161b22", borderRadius: "10px", border: "1px solid #30363d" }}>
          <Calendar size={40} style={{ color: "#8b949e", opacity: 0.3, marginBottom: "10px" }} />
          <h3 style={{ color: "#f0f6fc", margin: "0 0 6px 0" }}>No Matches Scheduled</h3>
          <p style={{ color: "#8b949e", fontSize: "13px" }}>Check back later for fixture announcements from your coach.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {filtered.map((match) => (
            <div
              key={match._id}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#05c7ee", fontWeight: "700" }}>
                    🏆 {match.tournamentName || "Tournament"} {match.round ? `• ${match.round}` : ""}
                  </div>
                  <strong style={{ fontSize: "15px", color: "#f0f6fc", marginTop: "2px", display: "block" }}>
                    {match.title}
                  </strong>
                </div>
                <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "4px", background: "rgba(5, 199, 238, 0.12)", color: "#05c7ee", fontWeight: "700" }}>
                  {match.status || "Scheduled"}
                </span>
              </div>

              <div style={{ background: "#0d1117", padding: "8px 12px", borderRadius: "6px", fontSize: "13px" }}>
                <strong style={{ color: "#f0f6fc" }}>{match.team1Name || "Team 1"}</strong> vs{" "}
                <strong style={{ color: "#f0f6fc" }}>{match.team2Name || "Opponent"}</strong>
                {match.score && (
                  <div style={{ color: "#34d399", fontSize: "11px", fontWeight: "700", marginTop: "4px" }}>
                    Score: {match.score}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "#8b949e" }}>
                <div>📅 <strong>Date:</strong> {match.date ? new Date(match.date).toLocaleDateString() : "-"} ({match.startTime} - {match.endTime})</div>
                <div>🏟️ <strong>Venue:</strong> {match.venue}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
