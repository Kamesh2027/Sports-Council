import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../../components/common/Modal";
import {
  Trophy,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Award,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  Check
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

const AdminTournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, ongoing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [deletingTournament, setDeletingTournament] = useState(null);

  // Form State
  const initialFormState = {
    name: "",
    sport: "Cricket",
    startDate: "",
    endDate: "",
    venue: "Main Sports Complex",
    location: "BIT Campus",
    status: "upcoming",
    description: "",
    organizer: "BIT Sports Council",
    prizePool: "",
    maxTeams: 16,
    registrationDeadline: "",
    eligibility: "Open to all registered students & teams"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError("");

      const hostname = window.location.hostname || "localhost";
      const res = await axios.get(`http://${hostname}:5000/api/admin/tournaments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTournaments(res.data.tournaments || []);
      setStats(res.data.stats || {
        total: res.data.tournaments?.length || 0,
        upcoming: res.data.tournaments?.filter((t) => t.status === "upcoming").length || 0,
        ongoing: res.data.tournaments?.filter((t) => t.status === "ongoing" || t.status === "in-progress").length || 0,
        completed: res.data.tournaments?.filter((t) => t.status === "completed").length || 0
      });
    } catch (err) {
      console.error("Failed to load tournaments:", err);
      setError(err.response?.data?.message || "Failed to load tournaments list");
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingTournament(null);
    setFormData(initialFormState);
    setFormError("");
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name || "",
      sport: tournament.sport || "Cricket",
      startDate: tournament.startDate ? new Date(tournament.startDate).toISOString().split("T")[0] : "",
      endDate: tournament.endDate ? new Date(tournament.endDate).toISOString().split("T")[0] : "",
      venue: tournament.venue || "Main Sports Complex",
      location: tournament.location || "BIT Campus",
      status: tournament.status || "upcoming",
      description: tournament.description || "",
      organizer: tournament.organizer || "BIT Sports Council",
      prizePool: tournament.prizePool || "",
      maxTeams: tournament.maxTeams || 16,
      registrationDeadline: tournament.registrationDeadline
        ? new Date(tournament.registrationDeadline).toISOString().split("T")[0]
        : "",
      eligibility: tournament.eligibility || "Open to all registered students & teams"
    });
    setFormError("");
    setShowAddModal(true);
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Tournament name is required.");
      return;
    }
    if (!formData.sport.trim()) {
      setFormError("Sport category is required.");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setFormError("Start date and End date are required.");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError("End date cannot be earlier than start date.");
      return;
    }

    setFormLoading(true);
    const hostname = window.location.hostname || "localhost";

    try {
      if (editingTournament) {
        // Update Tournament
        const res = await axios.put(
          `http://${hostname}:5000/api/admin/tournaments/${editingTournament._id || editingTournament.tournamentId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification(res.data.message || `Tournament '${formData.name}' updated successfully!`);
      } else {
        // Create Tournament
        const res = await axios.post(
          `http://${hostname}:5000/api/admin/tournaments`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification(res.data.message || `Tournament '${formData.name}' created successfully!`);
      }

      setShowAddModal(false);
      setTimeout(() => setNotification(""), 5000);
      loadTournaments();
    } catch (err) {
      console.error("Save tournament error:", err);
      setFormError(err.response?.data?.message || "Failed to save tournament.");
    } finally {
      setFormLoading(false);
    }
  };

  // Quick Status Change
  const handleQuickStatusChange = async (tournament, newStatus) => {
    const hostname = window.location.hostname || "localhost";
    try {
      const res = await axios.put(
        `http://${hostname}:5000/api/admin/tournaments/${tournament._id || tournament.tournamentId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification(`Tournament status updated to '${newStatus}'.`);
      setTimeout(() => setNotification(""), 4000);
      loadTournaments();
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  // Delete Tournament
  const handleDeleteConfirm = async () => {
    if (!deletingTournament) return;
    const hostname = window.location.hostname || "localhost";

    try {
      const res = await axios.delete(
        `http://${hostname}:5000/api/admin/tournaments/${deletingTournament._id || deletingTournament.tournamentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification(res.data.message || "Tournament deleted successfully.");
      setDeletingTournament(null);
      setTimeout(() => setNotification(""), 4000);
      loadTournaments();
    } catch (err) {
      console.error("Delete tournament error:", err);
      alert(err.response?.data?.message || "Failed to delete tournament.");
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

  // Filtered List
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
            Tournaments & Competitions
          </h1>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            Announce, manage, and coordinate university sports tournaments visible to all coaches and student athletes.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {/* <button
            onClick={loadTournaments}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#21262d",
              color: "#c9d1d9",
              border: "1px solid #30363d",
              padding: "10px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Refresh
          </button> */}

          <button
            type="button"
            onClick={handleOpenAdd}
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
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            {/* <Plus size={18} /> */}
            CREATE TOURNAMENT
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          style={{
            margin: "0 0 16px 0",
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

      {/* ERROR ALERT */}
      {error && (
        <div
          style={{
            margin: "0 0 16px 0",
            padding: "12px 16px",
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
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* METRICS ROW */}
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
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>{stats.total || tournaments.length}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Council registered meets</span>
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>UPCOMING EVENTS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#fbbf24" }}>{stats.upcoming}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Ready for registration</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#fbbf24" }}>
            <Clock size={24} />
          </div>
        </div>

        {/* ONGOING */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>ONGOING / LIVE</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#05c7ee" }}>{stats.ongoing}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Currently in progress</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5, 199, 238, 0.1)", color: "#05c7ee" }}>
            <Flame size={24} />
          </div>
        </div>

        {/* COMPLETED */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>COMPLETED MEETS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#4ade80" }}>{stats.completed}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Concluded events</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
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
        {/* Search Input */}
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
            placeholder="Search tournaments by name, ID, venue..."
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

      {/* TOURNAMENTS TABLE CARD */}
      <div
        className="management-card"
        style={{
          backgroundColor: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #21262d",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <h2 style={{ margin: 0, fontSize: "16px", color: "#f0f6fc", display: "flex", alignItems: "center", gap: "8px" }}>
            <Trophy size={18} color="#05c7ee" />
            Tournament Listings ({filteredTournaments.length})
          </h2>
          <span style={{ fontSize: "12px", color: "#8da3b5" }}>
            Sports Council Official Schedule
          </span>
        </div>

        <div className="management-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#8da3b5" }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: "8px" }} />
              <p>Loading tournaments list...</p>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <Trophy size={48} style={{ opacity: 0.25, color: "#8da3b5", marginBottom: "12px" }} />
              <h3 style={{ color: "#f0f6fc", fontSize: "16px", margin: "0 0 6px 0" }}>No Tournaments Found</h3>
              <p style={{ color: "#8da3b5", fontSize: "13px", margin: "0 0 16px 0" }}>
                {tournaments.length === 0
                  ? "No tournaments have been announced yet. Click '+ Create Tournament' to announce the first competition."
                  : "No tournaments matched your search/filter criteria."}
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                style={{
                  backgroundColor: "#05c7ee",
                  color: "#07131a",
                  fontWeight: "700",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                + Add New Tournament
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0d1117", borderBottom: "1px solid #21262d", color: "#8da3b5" }}>
                    <th style={{ padding: "12px 16px", fontWeight: "600", fontSize: "11px" }}>TOURNAMENT & ID</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600", fontSize: "11px" }}>SPORT</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600", fontSize: "11px" }}>DATES & DURATION</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600", fontSize: "11px" }}>VENUE & LOCATION</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600", fontSize: "11px" }}>PRIZE / TEAMS</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600", fontSize: "11px" }}>STATUS</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600", fontSize: "11px", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTournaments.map((tournament) => {
                    const start = tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : "-";
                    const end = tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : "-";

                    return (
                      <tr
                        key={tournament._id || tournament.tournamentId}
                        style={{ borderBottom: "1px solid #21262d", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        {/* Name & ID */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <strong style={{ color: "#f0f6fc", fontSize: "14px" }}>{tournament.name}</strong>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#8da3b5" }}>
                              <span style={{ color: "#05c7ee", fontWeight: "700" }}>{tournament.tournamentId}</span>
                              <span>• {tournament.organizer || "BIT Sports Council"}</span>
                            </div>
                            {tournament.description && (
                              <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#6e7681", maxWidth: "280px" }}>
                                {tournament.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Sport */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              backgroundColor: "rgba(5, 199, 238, 0.1)",
                              border: "1px solid rgba(5, 199, 238, 0.25)",
                              color: "#05c7ee",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600"
                            }}
                          >
                            {tournament.sport}
                          </span>
                        </td>

                        {/* Dates */}
                        <td style={{ padding: "14px 16px", color: "#c9d1d9" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Calendar size={14} color="#8da3b5" />
                            <span>{start} → {end}</span>
                          </div>
                        </td>

                        {/* Venue */}
                        <td style={{ padding: "14px 16px", color: "#8da3b5" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <MapPin size={14} color="#05c7ee" />
                            <span style={{ color: "#f0f6fc" }}>{tournament.venue || "Main Complex"}</span>
                          </div>
                          <span style={{ fontSize: "11px", marginLeft: "20px" }}>{tournament.location || "BIT Campus"}</span>
                        </td>

                        {/* Prize Pool & Teams */}
                        <td style={{ padding: "14px 16px" }}>
                          {tournament.prizePool ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#fbbf24", fontSize: "12px", fontWeight: "600" }}>
                              <Award size={13} />
                              <span>{tournament.prizePool}</span>
                            </div>
                          ) : (
                            <span style={{ color: "#6e7681", fontSize: "12px" }}>Trophy & Certificate</span>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8da3b5", fontSize: "11px", marginTop: "2px" }}>
                            <Users size={12} />
                            <span>Max {tournament.maxTeams || 16} teams</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 16px" }}>
                          {renderStatusBadge(tournament.status)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            {/* Schedule Fixtures Button */}
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/schedules?tournamentId=${tournament._id}&tournamentName=${encodeURIComponent(
                                    tournament.name
                                  )}`
                                )
                              }
                              title="Schedule Matches / Fixtures for this tournament"
                              style={{
                                backgroundColor: "rgba(5, 199, 238, 0.12)",
                                border: "1px solid rgba(5, 199, 238, 0.3)",
                                color: "#05c7ee",
                                padding: "5px 9px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                fontWeight: "700"
                              }}
                            >
                              <Calendar size={13} />
                              Schedule
                            </button>

                            {/* Status Changer Menu */}
                            <select
                              value={tournament.status || "upcoming"}
                              onChange={(e) => handleQuickStatusChange(tournament, e.target.value)}
                              style={{
                                backgroundColor: "#0d1117",
                                color: "#8da3b5",
                                border: "1px solid #30363d",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                fontSize: "11px",
                                cursor: "pointer"
                              }}
                            >
                              <option value="upcoming">Mark Upcoming</option>
                              <option value="ongoing">Mark Ongoing</option>
                              <option value="completed">Mark Completed</option>
                              <option value="cancelled">Mark Cancelled</option>
                            </select>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(tournament)}
                              title="Edit Tournament"
                              style={{
                                backgroundColor: "#21262d",
                                border: "1px solid #30363d",
                                color: "#58a6ff",
                                padding: "6px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setDeletingTournament(tournament)}
                              title="Delete Tournament"
                              style={{
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#f87171",
                                padding: "6px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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

      {/* CREATE / EDIT TOURNAMENT MODAL */}
      {showAddModal && (
        <Modal
          title={editingTournament ? `Edit Tournament: ${editingTournament.name}` : "Create New Sports Tournament"}
          onClose={() => setShowAddModal(false)}
          maxWidth="640px"
        >
          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {formError && (
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
                <span>{formError}</span>
              </div>
            )}

            {/* Tournament Name */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                TOURNAMENT NAME <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Annual Inter-Collegiate Cricket Trophy 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: "100%",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Sport & Status Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* Sport */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                  SPORT CATEGORY <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  required
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                >
                  {SPORTS_LIST.filter((s) => s !== "All Sports").map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                  CURRENT STATUS
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing / Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Start Date & End Date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                  START DATE <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                  END DATE <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Venue & Location */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                  VENUE / GROUND
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Athletic Stadium / Indoor Court 1"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                  LOCATION
                </label>
                <input
                  type="text"
                  placeholder="e.g. BIT Sathyamangalam Campus"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Prize Pool & Max Teams */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                  PRIZE POOL / AWARDS
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹50,000 + Rolling Trophy"
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                  MAX PARTICIPATING TEAMS
                </label>
                <input
                  type="number"
                  min="2"
                  max="128"
                  value={formData.maxTeams}
                  onChange={(e) => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Description & Rules */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#c9d1d9", marginBottom: "6px" }}>
                DESCRIPTION & TOURNAMENT RULES
              </label>
              <textarea
                rows="3"
                placeholder="Details regarding tournament format, match timings, gear requirements, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: "100%",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  resize: "vertical"
                }}
              />
            </div>

            {/* Modal Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={formLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#05c7ee",
                  border: "none",
                  borderRadius: "6px",
                  color: "#07131a",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {formLoading ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {editingTournament ? "Save Changes" : "Announce Tournament"}
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTournament && (
        <Modal
          title={`Delete Tournament: ${deletingTournament.name}`}
          onClose={() => setDeletingTournament(null)}
          maxWidth="460px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                padding: "14px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                color: "#f87171",
                fontSize: "13px",
                display: "flex",
                gap: "10px"
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Are you sure you want to delete this tournament?</strong>
                <p style={{ margin: "4px 0 0 0", color: "#c9d1d9", fontSize: "12px" }}>
                  Tournament <strong>{deletingTournament.name}</strong> ({deletingTournament.tournamentId}) will be permanently removed from all coach and student schedules.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setDeletingTournament(null)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc2626",
                  border: "none",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Trash2 size={14} />
                Delete Permanently
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminTournaments;