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
  CheckCircle2,
  ShieldCheck,
  Filter,
  Info
} from "lucide-react";

const SPORTS_LIST = [
  "All Sports",
  "Athletics",
  "Badminton",
  "Basketball",
  "Chess",
  "Cricket",
  "Football",
  "Handball",
  "Hockey",
  "Kabaddi",
  "Kho-Kho",
  "Swimming",
  "Table Tennis",
  "Tennis",
  "Volleyball"
];

const CoachTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [coachSport, setCoachSport] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError("");

      const hostname = window.location.hostname || "localhost";
      const [tourRes, coachRes] = await Promise.allSettled([
        axios.get(`http://${hostname}:5000/api/coach/tournaments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://${hostname}:5000/api/coach/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (tourRes.status === "fulfilled") {
        setTournaments(tourRes.value.data.tournaments || []);
      }
      if (coachRes.status === "fulfilled" && coachRes.value.data?.coach?.sport) {
        setCoachSport(coachRes.value.data.coach.sport);
      }
    } catch (err) {
      console.error("Failed to load tournaments:", err);
      setError("Failed to load tournaments schedule.");
    } finally {
      setLoading(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    const s = (status || "upcoming").toLowerCase();
    if (s === "upcoming") {
      return (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#fbbf24",
            fontSize: "11px",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Clock size={12} /> Upcoming
        </span>
      );
    }
    if (s === "ongoing" || s === "in-progress") {
      return (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            backgroundColor: "rgba(5, 199, 238, 0.15)",
            border: "1px solid rgba(5, 199, 238, 0.3)",
            color: "#05c7ee",
            fontSize: "11px",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Flame size={12} /> Ongoing / Live
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            color: "#4ade80",
            fontSize: "11px",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    }
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
        Cancelled
      </span>
    );
  };

  // Filtered Tournaments
  const filteredTournaments = tournaments.filter((t) => {
    const matchSearch =
      searchQuery === "" ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tournamentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSport = selectedSport === "All Sports" || t.sport?.toLowerCase() === selectedSport.toLowerCase();

    const matchStatus =
      selectedStatus === "all" ||
      t.status?.toLowerCase() === selectedStatus.toLowerCase() ||
      (selectedStatus === "ongoing" && (t.status === "ongoing" || t.status === "in-progress"));

    return matchSearch && matchSport && matchStatus;
  });

  const upcomingCount = tournaments.filter((t) => t.status === "upcoming").length;
  const ongoingCount = tournaments.filter((t) => t.status === "ongoing" || t.status === "in-progress").length;
  const mySportCount = coachSport ? tournaments.filter((t) => t.sport?.toLowerCase() === coachSport.toLowerCase()).length : 0;

  return (
    <div className="management-page" style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* HEADER */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px"
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f0f6fc", margin: "0 0 4px 0" }}>
            Sports Tournaments & Competitions
          </h1>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            Official university and inter-college tournament schedules announced by the Sports Council.
          </p>
        </div>

        <button
          onClick={loadTournaments}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#21262d",
            color: "#c9d1d9",
            border: "1px solid #30363d",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* QUICK METRICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "20px"
        }}
      >
        {/* TOTAL */}
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>TOTAL TOURNAMENTS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>{tournaments.length}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Council competitions</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5, 199, 238, 0.1)", color: "#05c7ee" }}>
            <Trophy size={24} />
          </div>
        </div>

        {/* UPCOMING */}
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>UPCOMING MEETS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#fbbf24" }}>{upcomingCount}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Scheduled ahead</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#fbbf24" }}>
            <Clock size={24} />
          </div>
        </div>

        {/* LIVE */}
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>LIVE / ONGOING</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#05c7ee" }}>{ongoingCount}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Matches in progress</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5, 199, 238, 0.1)", color: "#05c7ee" }}>
            <Flame size={24} />
          </div>
        </div>

        {/* MY SQUAD SPORT */}
        {coachSport && (
          <div
            style={{
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
            onClick={() => setSelectedSport(coachSport)}
          >
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>{coachSport.toUpperCase()} MEETS</span>
              <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#4ade80" }}>{mySportCount}</h2>
              <span style={{ fontSize: "11px", color: "#4ade80" }}>Click to filter squad sport</span>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }}>
              <Award size={24} />
            </div>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "16px",
          backgroundColor: "#161b22",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid #30363d"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "6px",
            padding: "8px 12px",
            flex: "1 1 240px"
          }}
        >
          <Search size={16} color="#8da3b5" />
          <input
            type="text"
            placeholder="Search tournaments by name, venue, sport..."
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

        {/* Sport Filter */}
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          style={{
            backgroundColor: "#0d1117",
            color: "#f0f6fc",
            border: "1px solid #30363d",
            borderRadius: "6px",
            padding: "8px 12px",
            fontSize: "13px"
          }}
        >
          {SPORTS_LIST.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            backgroundColor: "#0d1117",
            color: "#f0f6fc",
            border: "1px solid #30363d",
            borderRadius: "6px",
            padding: "8px 12px",
            fontSize: "13px"
          }}
        >
          <option value="all">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing / Live</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* TOURNAMENTS CARDS GRID */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#8da3b5" }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: "8px" }} />
          <p>Loading tournaments...</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "40px 20px",
            textAlign: "center"
          }}
        >
          <Trophy size={48} style={{ opacity: 0.25, color: "#8da3b5", marginBottom: "12px" }} />
          <h3 style={{ color: "#f0f6fc", fontSize: "16px", margin: "0 0 6px 0" }}>No Tournaments Listed</h3>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            {tournaments.length === 0
              ? "The Sports Council has not announced any tournaments yet. Scheduled competitions will appear here."
              : "No tournaments found matching the selected filter criteria."}
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
          {filteredTournaments.map((t) => {
            const startStr = t.startDate ? new Date(t.startDate).toLocaleDateString() : "-";
            const endStr = t.endDate ? new Date(t.endDate).toLocaleDateString() : "-";

            return (
              <div
                key={t._id || t.tournamentId}
                style={{
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "10px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.15s, border-color 0.15s",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#05c7ee")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#30363d")}
              >
                <div>
                  {/* Top Bar: Sport & Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        backgroundColor: "rgba(5, 199, 238, 0.15)",
                        border: "1px solid rgba(5, 199, 238, 0.3)",
                        color: "#05c7ee",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      {t.sport}
                    </span>

                    {renderStatusBadge(t.status)}
                  </div>

                  {/* Tournament Title */}
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#f0f6fc", fontWeight: "700" }}>
                    {t.name}
                  </h3>

                  <div style={{ fontSize: "11px", color: "#8da3b5", marginBottom: "14px" }}>
                    ID: <span style={{ color: "#05c7ee", fontWeight: "700" }}>{t.tournamentId}</span> • {t.organizer || "BIT Sports Council"}
                  </div>

                  {/* Details List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#c9d1d9" }}>
                    {/* Dates */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Calendar size={14} color="#8da3b5" style={{ flexShrink: 0 }} />
                      <span>{startStr} → {endStr}</span>
                    </div>

                    {/* Venue */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={14} color="#05c7ee" style={{ flexShrink: 0 }} />
                      <span>{t.venue || "Main Sports Complex"} ({t.location || "BIT Campus"})</span>
                    </div>

                    {/* Prize / Max Teams */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Award size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
                      <span style={{ color: t.prizePool ? "#fbbf24" : "#8da3b5" }}>
                        {t.prizePool ? t.prizePool : "Official Trophy & Certification"}
                      </span>
                    </div>

                    {t.maxTeams && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Users size={14} color="#8da3b5" style={{ flexShrink: 0 }} />
                        <span style={{ color: "#8da3b5" }}>Max {t.maxTeams} Teams registered</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {t.description && (
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "10px 12px",
                        backgroundColor: "#0d1117",
                        borderRadius: "6px",
                        border: "1px solid #21262d",
                        fontSize: "12px",
                        color: "#8da3b5",
                        lineHeight: "1.4"
                      }}
                    >
                      {t.description}
                    </div>
                  )}
                </div>

                {/* Footer note */}
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid #21262d",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "11px",
                    color: "#6e7681"
                  }}
                >
                  <span>{t.eligibility || "Open to all student athletes"}</span>
                  <span style={{ color: "#05c7ee" }}>Official Event</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoachTournaments;