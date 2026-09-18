import { useEffect, useState } from "react";
import axios from "axios";
import {
  Trophy,
  Calendar,
  MapPin,
  Award,
  Users,
  Search,
  RefreshCw,
  Clock,
  Flame,
  CheckCircle2
} from "lucide-react";

export default function StudentTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const hostname = window.location.hostname || "localhost";
      const res = await axios.get(`http://${hostname}:5000/api/student/tournaments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTournaments(res.data.tournaments || []);
    } catch (err) {
      console.error("Failed to fetch student tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tournaments.filter((t) => {
    const matchSearch =
      searchQuery === "" ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSport = selectedSport === "All Sports" || t.sport?.toLowerCase() === selectedSport.toLowerCase();

    return matchSearch && matchSport;
  });

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f0f6fc", margin: "0 0 4px" }}>
            Campus & State Tournaments
          </h1>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            Official sports competitions announced by the Sports Council.
          </p>
        </div>

        <button
          onClick={loadTournaments}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#21262d",
            color: "#c9d1d9",
            border: "1px solid #30363d",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {/* SEARCH BAR */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "6px",
            padding: "8px 12px",
            flex: 1
          }}
        >
          <Search size={16} color="#8da3b5" />
          <input
            type="text"
            placeholder="Search tournaments by name or sport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "#f0f6fc",
              fontSize: "13px",
              width: "100%"
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#8da3b5" }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: "8px" }} />
          <p>Loading tournaments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center"
          }}
        >
          <Trophy size={40} style={{ opacity: 0.3, color: "#8da3b5", marginBottom: "10px" }} />
          <h3 style={{ color: "#f0f6fc", margin: "0 0 6px" }}>No Tournaments Available</h3>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            Scheduled tournaments will be listed here when announced by the Sports Council.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {filtered.map((tour) => (
            <div
              key={tour._id || tour.tournamentId}
              style={{
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <strong style={{ fontSize: "15px", color: "#ffffff", display: "block" }}>{tour.name}</strong>
                    <span style={{ fontSize: "11px", color: "#05c7ee", fontWeight: "700" }}>
                      {tour.sport} • {tour.tournamentId}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      backgroundColor:
                        tour.status === "ongoing"
                          ? "rgba(5, 199, 238, 0.15)"
                          : tour.status === "completed"
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(245, 158, 11, 0.15)",
                      color:
                        tour.status === "ongoing"
                          ? "#05c7ee"
                          : tour.status === "completed"
                          ? "#4ade80"
                          : "#fbbf24"
                    }}
                  >
                    {tour.status || "Upcoming"}
                  </span>
                </div>

                {tour.description && (
                  <p style={{ fontSize: "12px", color: "#9da9b4", margin: "0 0 10px", lineHeight: "1.4" }}>
                    {tour.description}
                  </p>
                )}

                <div style={{ fontSize: "12px", color: "#c9d1d9", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={14} color="#05c7ee" />
                    <span>{tour.venue || "Main Sports Complex"} ({tour.location || "BIT Campus"})</span>
                  </div>
                  {tour.prizePool && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fbbf24" }}>
                      <Award size={14} color="#fbbf24" />
                      <span>{tour.prizePool}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ fontSize: "11px", color: "#8da3b5", borderTop: "1px solid #232c37", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
                <span>Start: {tour.startDate ? new Date(tour.startDate).toLocaleDateString() : "TBA"}</span>
                <span>End: {tour.endDate ? new Date(tour.endDate).toLocaleDateString() : "TBA"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
