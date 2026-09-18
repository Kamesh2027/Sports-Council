import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../../components/common/Modal";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Award,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ShieldCheck,
  X,
  ChevronRight,
  Activity,
  Check,
  ExternalLink
} from "lucide-react";

const ROUNDS_LIST = [
  "League Stage",
  "Group A Match",
  "Group B Match",
  "Quarter Final 1",
  "Quarter Final 2",
  "Quarter Final 3",
  "Quarter Final 4",
  "Semi Final 1",
  "Semi Final 2",
  "3rd Place Playoff",
  "Grand Final",
  "Friendly / Practice Match"
];

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

const AdminSchedules = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTournamentId = searchParams.get("tournamentId") || "all";
  const initialTournamentName = searchParams.get("tournamentName") || "";
  const initialVenue = searchParams.get("venue") || "all";

  // Data state
  const [schedules, setSchedules] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]); // Registered venues from database
  const [stats, setStats] = useState({ total: 0, upcoming: 0, live: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  // Filter state
  const [selectedTournament, setSelectedTournament] = useState(initialTournamentId);
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState(initialVenue);
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [scoreModalSchedule, setScoreModalSchedule] = useState(null);

  // Form State for Create / Edit
  const initialFormState = {
    tournamentId: initialTournamentId !== "all" ? initialTournamentId : "",
    tournamentName: initialTournamentName || "",
    title: "",
    sport: "Cricket",
    round: "League Stage",
    team1Id: "",
    team1Name: "",
    team2Id: "",
    team2Name: "",
    venue: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "12:00",
    status: "scheduled",
    score: "",
    winnerTeamId: "",
    winnerName: "",
    referee: "",
    remarks: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Overlap / Live Conflict Checker state
  const [availabilityState, setAvailabilityState] = useState({
    checking: false,
    available: null,
    conflictType: null,
    message: ""
  });
  const checkTimeoutRef = useRef(null);

  // Quick Score Update Form State
  const [scoreForm, setScoreForm] = useState({
    score: "",
    winnerTeamId: "",
    winnerName: "",
    status: "completed",
    remarks: ""
  });
  const [scoreLoading, setScoreLoading] = useState(false);

  const token = localStorage.getItem("token");
  const hostname = window.location.hostname || "localhost";
  const API_BASE = `http://${hostname}:5000/api/admin`;

  // Fetch initial data
  useEffect(() => {
    loadAllData();
  }, [selectedTournament, selectedSport, selectedStatus, selectedVenue, filterDate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Build query params
      const params = new URLSearchParams();
      if (selectedTournament && selectedTournament !== "all") {
        params.append("tournamentId", selectedTournament);
      }
      if (selectedSport && selectedSport !== "All Sports") {
        params.append("sport", selectedSport);
      }
      if (selectedStatus && selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      if (selectedVenue && selectedVenue !== "all") {
        params.append("venue", selectedVenue);
      }
      if (filterDate) {
        params.append("date", filterDate);
      }

      const [schedRes, tournRes, teamsRes, venuesRes] = await Promise.all([
        axios.get(`${API_BASE}/schedules?${params.toString()}`, { headers }),
        axios.get(`${API_BASE}/tournaments`, { headers }).catch(() => ({ data: { tournaments: [] } })),
        axios.get(`${API_BASE}/teams`, { headers }).catch(() => ({ data: { teams: [] } })),
        axios.get(`${API_BASE}/venues`, { headers }).catch(() => ({ data: { venues: [] } }))
      ]);

      setSchedules(schedRes.data.schedules || []);
      setStats(
        schedRes.data.stats || {
          total: schedRes.data.schedules?.length || 0,
          upcoming: schedRes.data.schedules?.filter((s) => s.status === "scheduled" || s.status === "upcoming").length || 0,
          live: schedRes.data.schedules?.filter((s) => s.status === "in-progress" || s.status === "ongoing").length || 0,
          completed: schedRes.data.schedules?.filter((s) => s.status === "completed").length || 0
        }
      );

      if (tournRes.data?.tournaments) {
        setTournaments(tournRes.data.tournaments);
      }
      if (teamsRes.data?.teams) {
        setTeams(teamsRes.data.teams);
      }
      if (venuesRes.data?.venues) {
        setVenues(venuesRes.data.venues);
      }
    } catch (err) {
      console.error("Failed to load schedules data:", err);
      setNotification("Failed to load schedule fixtures. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Live Overlap / Availability Checker
  const checkLiveAvailability = (currentForm, excludeId = null) => {
    const activeVenue = currentForm.venue ? currentForm.venue.trim() : "";

    if (!activeVenue || !currentForm.date || !currentForm.startTime || !currentForm.endTime) {
      setAvailabilityState({ checking: false, available: null, conflictType: null, message: "" });
      return;
    }

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    setAvailabilityState((prev) => ({ ...prev, checking: true }));

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const query = new URLSearchParams({
          venue: activeVenue,
          date: currentForm.date,
          startTime: currentForm.startTime,
          endTime: currentForm.endTime
        });

        if (currentForm.team1Id) query.append("team1Id", currentForm.team1Id);
        if (currentForm.team2Id) query.append("team2Id", currentForm.team2Id);
        if (excludeId) query.append("excludeId", excludeId);

        const res = await axios.get(`${API_BASE}/schedules/check-availability?${query.toString()}`, { headers });

        if (res.data.success) {
          setAvailabilityState({
            checking: false,
            available: res.data.available,
            conflictType: res.data.conflictType || null,
            message: res.data.message
          });
        }
      } catch (err) {
        setAvailabilityState({
          checking: false,
          available: false,
          conflictType: "error",
          message: err.response?.data?.message || "Time slot validation error."
        });
      }
    }, 350);
  };

  // Open Create Schedule Modal
  const handleOpenAdd = () => {
    setEditingSchedule(null);
    let defaultSport = "Cricket";
    let defaultTournName = "";
    if (selectedTournament !== "all") {
      const matchT = tournaments.find((t) => String(t._id) === String(selectedTournament));
      if (matchT) {
        defaultSport = matchT.sport;
        defaultTournName = matchT.name;
      }
    }

    // Pick first available venue from registered venues
    const defaultVenue = venues.length > 0 ? venues[0].name : "";

    const newForm = {
      ...initialFormState,
      tournamentId: selectedTournament !== "all" ? selectedTournament : "",
      tournamentName: defaultTournName,
      sport: defaultSport,
      venue: defaultVenue,
      title: defaultTournName ? `${defaultTournName} - Match 1` : ""
    };
    setFormData(newForm);
    setFormError("");
    setAvailabilityState({ checking: false, available: null, conflictType: null, message: "" });
    setShowAddModal(true);

    if (defaultVenue) {
      checkLiveAvailability(newForm, null);
    }
  };

  // Open Edit Schedule Modal
  const handleOpenEdit = (schedule) => {
    setEditingSchedule(schedule);
    const editForm = {
      tournamentId: schedule.tournamentId?._id || schedule.tournamentId || "",
      tournamentName: schedule.tournamentName || schedule.tournamentId?.name || "",
      title: schedule.title || "",
      sport: schedule.sport || "Cricket",
      round: schedule.round || "League Stage",
      team1Id: schedule.team1Id?._id || schedule.team1Id || "",
      team1Name: schedule.team1Name || schedule.team1Id?.name || "",
      team2Id: schedule.team2Id?._id || schedule.team2Id || "",
      team2Name: schedule.team2Name || schedule.team2Id?.name || "",
      venue: schedule.venue || (venues.length > 0 ? venues[0].name : ""),
      date: schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : "",
      startTime: schedule.startTime || "10:00",
      endTime: schedule.endTime || "12:00",
      status: schedule.status || "scheduled",
      score: schedule.score || "",
      winnerTeamId: schedule.winnerTeamId?._id || schedule.winnerTeamId || "",
      winnerName: schedule.winnerName || "",
      referee: schedule.referee || "",
      remarks: schedule.remarks || ""
    };

    setFormData(editForm);
    setFormError("");
    setShowAddModal(true);

    checkLiveAvailability(editForm, schedule._id);
  };

  // Handle Form Change with Live Overlap Check
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    // Auto-update tournament name & sport if tournament changed
    if (name === "tournamentId") {
      if (value) {
        const found = tournaments.find((t) => String(t._id) === String(value));
        if (found) {
          updated.tournamentName = found.name;
          updated.sport = found.sport;
          if (!formData.title || formData.title.includes("Match")) {
            updated.title = `${found.name} - ${updated.round || "Match"}`;
          }
        }
      } else {
        updated.tournamentName = "";
      }
    }

    // Auto-update Team names if Team IDs changed
    if (name === "team1Id") {
      const t1 = teams.find((t) => String(t._id) === String(value));
      if (t1) {
        updated.team1Name = t1.name;
        if (t1.sport && (!formData.sport || formData.sport === "General")) {
          updated.sport = t1.sport;
        }
      }
    }

    if (name === "team2Id") {
      const t2 = teams.find((t) => String(t._id) === String(value));
      if (t2) {
        updated.team2Name = t2.name;
      }
    }

    // Auto-adjust End Time on Duration Helpers
    if (name === "startTime" && value) {
      const [h, m] = value.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const endH = (h + 2) % 24;
        updated.endTime = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }
    }

    // Auto-generate title if empty
    if ((name === "team1Id" || name === "team2Id" || name === "round") && !editingSchedule) {
      const t1Name = updated.team1Name || "Team 1";
      const t2Name = updated.team2Name || "Team 2";
      if (updated.team1Name && updated.team2Name) {
        updated.title = `${t1Name} vs ${t2Name} (${updated.round})`;
      }
    }

    setFormData(updated);
    checkLiveAvailability(updated, editingSchedule?._id || null);
  };

  // Helper for Duration buttons
  const handleSetDuration = (hours) => {
    if (!formData.startTime) return;
    const [h, m] = formData.startTime.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const totalMin = h * 60 + m + hours * 60;
      const newH = Math.floor(totalMin / 60) % 24;
      const newM = totalMin % 60;
      const newEndTime = `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
      const updated = { ...formData, endTime: newEndTime };
      setFormData(updated);
      checkLiveAvailability(updated, editingSchedule?._id || null);
    }
  };

  // Submit Schedule Form
  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    setFormError("");

    const finalVenue = formData.venue ? formData.venue.trim() : "";

    if (!finalVenue) {
      setFormError("Please select a registered match venue from the dropdown.");
      return;
    }

    if (!formData.title.trim()) {
      setFormError("Please enter a match / fixture title.");
      return;
    }

    if (!formData.date) {
      setFormError("Please select a match date.");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setFormError("Please specify both start time and end time.");
      return;
    }

    if (formData.team1Id && formData.team2Id && formData.team1Id === formData.team2Id) {
      setFormError("Team 1 and Team 2 cannot be the same team.");
      return;
    }

    // Check if overlap conflict was flagged
    if (availabilityState.available === false) {
      setFormError(`Cannot schedule: ${availabilityState.message}`);
      return;
    }

    setFormLoading(true);

    const payload = {
      ...formData,
      venue: finalVenue,
      tournamentId: formData.tournamentId || null,
      team1Id: formData.team1Id || null,
      team2Id: formData.team2Id || null,
      winnerTeamId: formData.winnerTeamId || null
    };

    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (editingSchedule) {
        const res = await axios.put(`${API_BASE}/schedules/${editingSchedule._id}`, payload, { headers });
        setNotification(res.data.message || `Match '${formData.title}' updated successfully!`);
      } else {
        const res = await axios.post(`${API_BASE}/schedules`, payload, { headers });
        setNotification(res.data.message || `Match '${formData.title}' scheduled without conflicts!`);
      }

      setShowAddModal(false);
      setTimeout(() => setNotification(""), 5000);
      loadAllData();
    } catch (err) {
      console.error("Save schedule error:", err);
      if (err.response?.status === 409) {
        setFormError(`⚠️ ${err.response.data.message}`);
      } else {
        setFormError(err.response?.data?.message || "Failed to schedule match. Please try again.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Open Quick Score Modal
  const handleOpenScoreModal = (schedule) => {
    setScoreModalSchedule(schedule);
    setScoreForm({
      score: schedule.score || "",
      winnerTeamId: schedule.winnerTeamId?._id || schedule.winnerTeamId || "",
      winnerName: schedule.winnerName || "",
      status: schedule.status === "scheduled" ? "completed" : schedule.status,
      remarks: schedule.remarks || ""
    });
  };

  // Submit Quick Score
  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!scoreModalSchedule) return;

    setScoreLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `${API_BASE}/schedules/${scoreModalSchedule._id}`,
        {
          score: scoreForm.score,
          winnerTeamId: scoreForm.winnerTeamId || null,
          winnerName: scoreForm.winnerName,
          status: scoreForm.status,
          remarks: scoreForm.remarks
        },
        { headers }
      );

      setNotification(res.data.message || "Match score & status updated successfully!");
      setScoreModalSchedule(null);
      setTimeout(() => setNotification(""), 4000);
      loadAllData();
    } catch (err) {
      console.error("Score update error:", err);
      alert(err.response?.data?.message || "Failed to update match score.");
    } finally {
      setScoreLoading(false);
    }
  };

  // Delete Schedule Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingSchedule) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.delete(`${API_BASE}/schedules/${deletingSchedule._id}`, { headers });
      setNotification(res.data.message || "Match fixture removed successfully.");
      setDeletingSchedule(null);
      setTimeout(() => setNotification(""), 4000);
      loadAllData();
    } catch (err) {
      console.error("Delete schedule error:", err);
      alert(err.response?.data?.message || "Failed to delete schedule fixture.");
    }
  };

  // Filtered schedules for client search
  const filteredSchedules = schedules.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.scheduleId && s.scheduleId.toLowerCase().includes(q)) ||
      (s.tournamentName && s.tournamentName.toLowerCase().includes(q)) ||
      (s.team1Name && s.team1Name.toLowerCase().includes(q)) ||
      (s.team2Name && s.team2Name.toLowerCase().includes(q)) ||
      (s.venue && s.venue.toLowerCase().includes(q)) ||
      (s.sport && s.sport.toLowerCase().includes(q))
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

  const activeTournamentObj = tournaments.find((t) => String(t._id) === String(selectedTournament));

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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#f0f6fc", margin: 0 }}>
              Tournament Match Schedules
            </h1>
            <span
              style={{
                backgroundColor: "rgba(5, 199, 238, 0.15)",
                color: "#05c7ee",
                padding: "2px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "700",
                border: "1px solid rgba(5, 199, 238, 0.3)"
              }}
            >
              Strict Overlap-Protection
            </span>
          </div>
          <p style={{ color: "#8b949e", marginTop: "4px", fontSize: "14px" }}>
            Schedule matches for tournaments. Only venues registered in the Venues section are available for assignment.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => navigate("/admin/venues")}
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
            title="Manage physical venues & grounds"
          >
            <MapPin size={14} color="#05c7ee" />
            Manage Venues ({venues.length})
          </button>

          <button
            onClick={loadAllData}
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
            title="Refresh fixtures"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleOpenAdd}
            style={{
              padding: "10px 18px",
              backgroundColor: "#05c7ee",
              border: "none",
              borderRadius: "8px",
              color: "#07131a",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 15px rgba(5, 199, 238, 0.3)"
            }}
          >
            <Plus size={18} />
            Schedule Match
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          style={{
            padding: "12px 18px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid #10b981",
            borderRadius: "8px",
            color: "#34d399",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          <CheckCircle2 size={18} />
          <span>{notification}</span>
          <button
            onClick={() => setNotification("")}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#34d399", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "24px"
        }}
      >
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "16px",
            borderLeft: "4px solid #05c7ee"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b949e", fontSize: "12px", fontWeight: "700" }}>
            <span>TOTAL FIXTURES</span>
            <Calendar size={16} color="#05c7ee" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#f0f6fc", marginTop: "8px" }}>
            {stats.total}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Across all tournaments</div>
        </div>

        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "16px",
            borderLeft: "4px solid #f59e0b"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b949e", fontSize: "12px", fontWeight: "700" }}>
            <span>UPCOMING MATCHES</span>
            <Clock size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#fbbf24", marginTop: "8px" }}>
            {stats.upcoming}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Ready to be played</div>
        </div>

        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "16px",
            borderLeft: "4px solid #10b981"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b949e", fontSize: "12px", fontWeight: "700" }}>
            <span>LIVE NOW</span>
            <Activity size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#34d399", marginTop: "8px" }}>
            {stats.live}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Matches in progress</div>
        </div>

        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "16px",
            borderLeft: "4px solid #3b82f6"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b949e", fontSize: "12px", fontWeight: "700" }}>
            <span>COMPLETED</span>
            <Trophy size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#60a5fa", marginTop: "8px" }}>
            {stats.completed}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Results recorded</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "24px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        {/* SEARCH INPUT */}
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: "200px" }}>
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
            placeholder="Search match title, team, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#c9d1d9",
              fontSize: "13px",
              outline: "none"
            }}
          />
        </div>

        {/* TOURNAMENT SELECTOR */}
        <select
          value={selectedTournament}
          onChange={(e) => {
            setSelectedTournament(e.target.value);
            if (e.target.value === "all") {
              setSearchParams({});
            } else {
              setSearchParams({ tournamentId: e.target.value });
            }
          }}
          style={{
            padding: "9px 12px",
            backgroundColor: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#c9d1d9",
            fontSize: "13px",
            outline: "none"
          }}
        >
          <option value="all">All Tournaments</option>
          {tournaments.map((t) => (
            <option key={t._id} value={t._id}>
              🏆 {t.name} ({t.sport})
            </option>
          ))}
        </select>

        {/* SPORT SELECTOR */}
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          style={{
            padding: "9px 12px",
            backgroundColor: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#c9d1d9",
            fontSize: "13px",
            outline: "none"
          }}
        >
          {SPORTS_LIST.map((sp) => (
            <option key={sp} value={sp}>
              {sp}
            </option>
          ))}
        </select>

        {/* VENUE FILTER (POPULATED ONLY FROM REGISTERED VENUES) */}
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          style={{
            padding: "9px 12px",
            backgroundColor: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#c9d1d9",
            fontSize: "13px",
            outline: "none"
          }}
        >
          <option value="all">All Registered Venues</option>
          {venues.map((v) => (
            <option key={v._id} value={v.name}>
              🏟️ {v.name}
            </option>
          ))}
        </select>

        {/* STATUS SELECTOR */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: "9px 12px",
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
          <option value="in-progress">Live / In-Progress</option>
          <option value="completed">Completed</option>
          <option value="postponed">Postponed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* DATE FILTER */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{
            padding: "9px 12px",
            backgroundColor: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#c9d1d9",
            fontSize: "13px",
            outline: "none"
          }}
        />

        {/* RESET FILTERS */}
        {(selectedTournament !== "all" ||
          selectedSport !== "All Sports" ||
          selectedStatus !== "all" ||
          selectedVenue !== "all" ||
          filterDate ||
          searchQuery) && (
          <button
            onClick={() => {
              setSelectedTournament("all");
              setSelectedSport("All Sports");
              setSelectedStatus("all");
              setSelectedVenue("all");
              setFilterDate("");
              setSearchQuery("");
              setSearchParams({});
            }}
            style={{
              padding: "8px 12px",
              backgroundColor: "#21262d",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#8b949e",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Reset Filters
          </button>
        )}

        {/* VIEW MODE TOGGLE */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
          <button
            onClick={() => setViewMode("cards")}
            style={{
              padding: "8px 12px",
              backgroundColor: viewMode === "cards" ? "#05c7ee" : "#21262d",
              color: viewMode === "cards" ? "#07131a" : "#c9d1d9",
              border: "1px solid #30363d",
              borderRadius: "6px 0 0 6px",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Card View
          </button>
          <button
            onClick={() => setViewMode("table")}
            style={{
              padding: "8px 12px",
              backgroundColor: viewMode === "table" ? "#05c7ee" : "#21262d",
              color: viewMode === "table" ? "#07131a" : "#c9d1d9",
              border: "1px solid #30363d",
              borderRadius: "0 6px 6px 0",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Table View
          </button>
        </div>
      </div>

      {/* SCHEDULES CONTENT */}
      {loading ? (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "50px",
            textAlign: "center"
          }}
        >
          <RefreshCw size={28} className="animate-spin" style={{ color: "#05c7ee", marginBottom: "12px" }} />
          <h3 style={{ color: "#f0f6fc", fontSize: "16px", margin: 0 }}>Loading match schedules & fixtures...</h3>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "60px 20px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📅</div>
          <h3 style={{ fontSize: "18px", color: "#f0f6fc", margin: "0 0 6px 0" }}>No Match Schedules Found</h3>
          <p style={{ color: "#8b949e", fontSize: "14px", maxWidth: "450px", margin: "0 auto 20px auto" }}>
            {selectedTournament !== "all"
              ? "No match fixtures have been scheduled for this tournament yet. Click below to schedule a match."
              : "No fixtures match the selected search and filter criteria."}
          </p>
          <button
            onClick={handleOpenAdd}
            style={{
              padding: "10px 20px",
              backgroundColor: "#05c7ee",
              border: "none",
              borderRadius: "8px",
              color: "#07131a",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Plus size={16} />
            Schedule First Match
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* CARDS GRID VIEW */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "18px"
          }}
        >
          {filteredSchedules.map((match) => (
            <div
              key={match._id}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
              }}
            >
              {/* CARD TOP BAR */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "#0d1117",
                  borderBottom: "1px solid #21262d",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Trophy size={14} color="#05c7ee" />
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#05c7ee" }}>
                    {match.tournamentName || "Tournament Fixture"}
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
                    {match.round || "Match"}
                  </span>
                </div>
                {renderStatusBadge(match.status)}
              </div>

              {/* CARD BODY */}
              <div style={{ padding: "16px", flex: 1 }}>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: "#f0f6fc",
                    margin: "0 0 14px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>{match.title}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#8b949e",
                      background: "#21262d",
                      padding: "2px 8px",
                      borderRadius: "4px"
                    }}
                  >
                    {match.scheduleId}
                  </span>
                </h3>

                {/* TEAMS MATCHUP CONTAINER */}
                <div
                  style={{
                    background: "#0d1117",
                    border: "1px solid #21262d",
                    borderRadius: "10px",
                    padding: "12px",
                    marginBottom: "14px"
                  }}
                >
                  {/* TEAM 1 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      borderBottom: "1px solid #161b22"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "rgba(5, 199, 238, 0.15)",
                          color: "#05c7ee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "800"
                        }}
                      >
                        1
                      </div>
                      <strong style={{ fontSize: "14px", color: "#f0f6fc" }}>
                        {match.team1Name || match.team1Id?.name || "Team 1 (TBA)"}
                      </strong>
                    </div>

                    {match.winnerTeamId &&
                      String(match.winnerTeamId._id || match.winnerTeamId) === String(match.team1Id?._id || match.team1Id) && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#fbbf24",
                            background: "rgba(245, 158, 11, 0.15)",
                            padding: "2px 6px",
                            borderRadius: "4px"
                          }}
                        >
                          👑 WINNER
                        </span>
                      )}
                  </div>

                  {/* VS BADGE */}
                  <div style={{ textAlign: "center", margin: "-6px 0", position: "relative", zIndex: 1 }}>
                    <span
                      style={{
                        background: "#21262d",
                        color: "#8b949e",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "10px",
                        fontWeight: "800",
                        border: "1px solid #30363d"
                      }}
                    >
                      VS
                    </span>
                  </div>

                  {/* TEAM 2 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#f87171",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "800"
                        }}
                      >
                        2
                      </div>
                      <strong style={{ fontSize: "14px", color: "#f0f6fc" }}>
                        {match.team2Name || match.team2Id?.name || "Team 2 (TBA)"}
                      </strong>
                    </div>

                    {match.winnerTeamId &&
                      String(match.winnerTeamId._id || match.winnerTeamId) === String(match.team2Id?._id || match.team2Id) && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#fbbf24",
                            background: "rgba(245, 158, 11, 0.15)",
                            padding: "2px 6px",
                            borderRadius: "4px"
                          }}
                        >
                          👑 WINNER
                        </span>
                      )}
                  </div>

                  {/* SCORE DISPLAY */}
                  {match.score && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "6px 10px",
                        background: "#161b22",
                        borderRadius: "6px",
                        border: "1px dashed #30363d",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "#8b949e", fontWeight: "700" }}>SCORE / RESULT:</span>
                      <strong style={{ fontSize: "13px", color: "#34d399" }}>{match.score}</strong>
                    </div>
                  )}
                </div>

                {/* MATCH DETAILS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "#8b949e" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={13} color="#05c7ee" />
                    <span style={{ color: "#c9d1d9", fontWeight: "600" }}>
                      {match.date ? new Date(match.date).toLocaleDateString() : "Date TBA"}
                    </span>
                    <span style={{ margin: "0 4px" }}>•</span>
                    <Clock size={13} color="#f59e0b" />
                    <span style={{ color: "#c9d1d9", fontWeight: "600" }}>
                      {match.startTime} - {match.endTime}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={13} color="#10b981" />
                    <span style={{ color: "#f0f6fc", fontWeight: "600" }}>{match.venue}</span>
                  </div>

                  {match.referee && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Award size={13} color="#a78bfa" />
                      <span>Referee: <strong style={{ color: "#c9d1d9" }}>{match.referee}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD FOOTER */}
              <div
                style={{
                  padding: "10px 16px",
                  background: "#0d1117",
                  borderTop: "1px solid #21262d",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#34d399", fontSize: "11px", fontWeight: "600" }}>
                  <ShieldCheck size={14} />
                  <span>Overlap-Checked</span>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => handleOpenScoreModal(match)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#21262d",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      color: "#fbbf24",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                    title="Record score & winner"
                  >
                    <Trophy size={12} />
                    Score
                  </button>

                  <button
                    onClick={() => handleOpenEdit(match)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#21262d",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      color: "#c9d1d9",
                      fontSize: "11px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                    title="Edit fixture"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>

                  <button
                    onClick={() => setDeletingSchedule(match)}
                    style={{
                      padding: "5px 8px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "6px",
                      color: "#f87171",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                    title="Delete fixture"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            overflow: "hidden"
          }}
        >
          <div className="admin-table-wrapper">
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#0d1117", borderBottom: "1px solid #30363d", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px" }}>FIXTURE ID</th>
                  <th style={{ padding: "12px 16px" }}>TOURNAMENT & ROUND</th>
                  <th style={{ padding: "12px 16px" }}>TEAMS</th>
                  <th style={{ padding: "12px 16px" }}>DATE & TIME</th>
                  <th style={{ padding: "12px 16px" }}>VENUE</th>
                  <th style={{ padding: "12px 16px" }}>STATUS</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((match) => (
                  <tr key={match._id} style={{ borderBottom: "1px solid #21262d" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#05c7ee" }}>
                      {match.scheduleId}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <strong style={{ color: "#f0f6fc", display: "block" }}>
                        {match.tournamentName || "Tournament"}
                      </strong>
                      <span style={{ fontSize: "11px", color: "#8b949e" }}>
                        {match.sport} • {match.round}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#f0f6fc", fontWeight: "700" }}>{match.team1Name || "Team 1"}</span>
                        <span style={{ color: "#8b949e", fontSize: "11px" }}>vs</span>
                        <span style={{ color: "#f0f6fc", fontWeight: "700" }}>{match.team2Name || "Team 2"}</span>
                      </div>
                      {match.score && (
                        <div style={{ fontSize: "11px", color: "#34d399", fontWeight: "600" }}>
                          Result: {match.score}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ color: "#f0f6fc", fontWeight: "600" }}>
                        {match.date ? new Date(match.date).toLocaleDateString() : "-"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#8b949e" }}>
                        {match.startTime} - {match.endTime}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#f0f6fc" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} color="#10b981" />
                        {match.venue}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {renderStatusBadge(match.status)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          onClick={() => handleOpenScoreModal(match)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#21262d",
                            border: "1px solid #30363d",
                            borderRadius: "4px",
                            color: "#fbbf24",
                            cursor: "pointer",
                            fontSize: "11px"
                          }}
                          title="Record score"
                        >
                          <Trophy size={12} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(match)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#21262d",
                            border: "1px solid #30363d",
                            borderRadius: "4px",
                            color: "#c9d1d9",
                            cursor: "pointer",
                            fontSize: "11px"
                          }}
                          title="Edit fixture"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setDeletingSchedule(match)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            borderRadius: "4px",
                            color: "#f87171",
                            cursor: "pointer",
                            fontSize: "11px"
                          }}
                          title="Delete fixture"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* CREATE / EDIT MATCH SCHEDULE MODAL                      */}
      {/* ======================================================= */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={editingSchedule ? `Edit Match: ${editingSchedule.scheduleId}` : "Schedule New Tournament Match"}
        >
          <form onSubmit={handleSubmitSchedule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* ERROR DISPLAY */}
            {formError && (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  borderRadius: "6px",
                  color: "#f87171",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            {/* VENUES WARNING IF EMPTY */}
            {venues.length === 0 && (
              <div
                style={{
                  padding: "12px 14px",
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid #f59e0b",
                  borderRadius: "6px",
                  color: "#fbbf24",
                  fontSize: "13px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>⚠️ No registered sports venues found. Please add a venue in the Venues section first.</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    navigate("/admin/venues");
                  }}
                  style={{
                    backgroundColor: "#f59e0b",
                    color: "#07131a",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontWeight: "700",
                    fontSize: "11px",
                    cursor: "pointer"
                  }}
                >
                  Go to Venues
                </button>
              </div>
            )}

            {/* LIVE OVERLAP / CONFLICT BANNER */}
            {availabilityState.checking ? (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "rgba(5, 199, 238, 0.08)",
                  border: "1px solid rgba(5, 199, 238, 0.3)",
                  borderRadius: "6px",
                  color: "#05c7ee",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <RefreshCw size={14} className="animate-spin" />
                <span>Checking venue and team slot availability...</span>
              </div>
            ) : availabilityState.available === false ? (
              <div
                style={{
                  padding: "12px 14px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  borderRadius: "6px",
                  color: "#fca5a5",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px"
                }}
              >
                <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: "1px" }} />
                <div>
                  <strong style={{ color: "#ef4444", display: "block", marginBottom: "2px" }}>
                    ⚠️ Overlap Conflict Detected! (Time & Venue Cannot Overlap)
                  </strong>
                  <span>{availabilityState.message}</span>
                </div>
              </div>
            ) : availabilityState.available === true ? (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid #10b981",
                  borderRadius: "6px",
                  color: "#34d399",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <CheckCircle2 size={16} color="#10b981" />
                <span>
                  <strong>Slot Available!</strong> {availabilityState.message}
                </span>
              </div>
            ) : null}

            {/* ROW 1: TOURNAMENT & ROUND */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Tournament (Optional)
                </label>
                <select
                  name="tournamentId"
                  value={formData.tournamentId}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                >
                  <option value="">-- Standalone / General Fixture --</option>
                  {tournaments.map((t) => (
                    <option key={t._id} value={t._id}>
                      🏆 {t.name} ({t.sport})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Tournament Round / Stage *
                </label>
                <select
                  name="round"
                  value={formData.round}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                >
                  {ROUNDS_LIST.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 2: FIXTURE TITLE & SPORT */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Fixture / Match Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Quarter Final 1: Tigers vs Eagles"
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Sport *
                </label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                >
                  {SPORTS_LIST.filter((s) => s !== "All Sports").map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROW 3: TEAM 1 & TEAM 2 SELECTORS */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid #21262d",
                borderRadius: "8px",
                padding: "14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px"
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#05c7ee" }}>
                  Team 1 (Home Squad)
                </label>
                <select
                  name="team1Id"
                  value={formData.team1Id}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none",
                    marginBottom: "8px"
                  }}
                >
                  <option value="">-- Select Registered Team 1 --</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      🛡️ {t.name} ({t.sport})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="team1Name"
                  value={formData.team1Name}
                  onChange={handleFormChange}
                  placeholder="Or custom Team 1 name"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    backgroundColor: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "4px",
                    color: "#c9d1d9",
                    fontSize: "12px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#f87171" }}>
                  Team 2 (Opponent Squad)
                </label>
                <select
                  name="team2Id"
                  value={formData.team2Id}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none",
                    marginBottom: "8px"
                  }}
                >
                  <option value="">-- Select Registered Team 2 --</option>
                  {teams
                    .filter((t) => String(t._id) !== String(formData.team1Id))
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        ⚔️ {t.name} ({t.sport})
                      </option>
                    ))}
                </select>
                <input
                  type="text"
                  name="team2Name"
                  value={formData.team2Name}
                  onChange={handleFormChange}
                  placeholder="Or custom Team 2 / Opponent name"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    backgroundColor: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "4px",
                    color: "#c9d1d9",
                    fontSize: "12px",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            {/* ROW 4: VENUE SELECTION (STRICTLY FROM REGISTERED VENUES) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Match Venue * (Selected from Venues Management)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    navigate("/admin/venues");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#05c7ee",
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px"
                  }}
                >
                  <ExternalLink size={11} />
                  + Add / Edit Venues
                </button>
              </div>

              {venues.length === 0 ? (
                <div style={{ padding: "10px", background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", color: "#f87171", fontSize: "12px" }}>
                  No venues found in database. Please click "+ Add / Edit Venues" above to register your sports grounds.
                </div>
              ) : (
                <select
                  name="venue"
                  value={formData.venue}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                >
                  <option value="">-- Choose Registered Venue --</option>
                  {venues.map((v) => (
                    <option key={v._id} value={v.name}>
                      🏟️ {v.name} ({v.location ? `${v.location} • ` : ""}{v.sport || "General"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ROW 5: DATE & TIME SLOTS */}
            <div
              style={{
                background: "#0d1117",
                border: "1px solid #21262d",
                borderRadius: "8px",
                padding: "14px",
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr",
                gap: "12px",
                alignItems: "flex-end"
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Match Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            {/* QUICK DURATION SUGGESTIONS */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "#8b949e" }}>Quick Duration:</span>
              <button
                type="button"
                onClick={() => handleSetDuration(1)}
                style={{
                  padding: "4px 8px",
                  background: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "4px",
                  color: "#c9d1d9",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => handleSetDuration(1.5)}
                style={{
                  padding: "4px 8px",
                  background: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "4px",
                  color: "#c9d1d9",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                +1.5 Hours
              </button>
              <button
                type="button"
                onClick={() => handleSetDuration(2)}
                style={{
                  padding: "4px 8px",
                  background: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "4px",
                  color: "#c9d1d9",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => handleSetDuration(3)}
                style={{
                  padding: "4px 8px",
                  background: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "4px",
                  color: "#c9d1d9",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                +3 Hours
              </button>
            </div>

            {/* ROW 6: REFEREE, STATUS & NOTES */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Referee / Official (Optional)
                </label>
                <input
                  type="text"
                  name="referee"
                  value={formData.referee}
                  onChange={handleFormChange}
                  placeholder="e.g. Official J. Smith"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Match Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#c9d1d9",
                    fontSize: "13px",
                    outline: "none"
                  }}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In-Progress / Live</option>
                  <option value="completed">Completed</option>
                  <option value="postponed">Postponed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "10px",
                borderTop: "1px solid #21262d",
                paddingTop: "14px"
              }}
            >
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: "9px 16px",
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
                disabled={formLoading || availabilityState.available === false}
                style={{
                  padding: "9px 20px",
                  backgroundColor: availabilityState.available === false ? "#4b5563" : "#05c7ee",
                  border: "none",
                  borderRadius: "6px",
                  color: availabilityState.available === false ? "#9ca3af" : "#07131a",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: availabilityState.available === false ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: availabilityState.available === false ? "none" : "0 0 12px rgba(5, 199, 238, 0.3)"
                }}
              >
                {formLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Saving Fixture...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {editingSchedule ? "Save Changes" : "Confirm Schedule"}
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================= */}
      {/* QUICK SCORE & RESULT MODAL                              */}
      {/* ======================================================= */}
      {scoreModalSchedule && (
        <Modal
          isOpen={Boolean(scoreModalSchedule)}
          onClose={() => setScoreModalSchedule(null)}
          title={`Update Match Score & Result: ${scoreModalSchedule.scheduleId}`}
        >
          <form onSubmit={handleSubmitScore} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                background: "#0d1117",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #21262d",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "11px", color: "#8b949e", fontWeight: "700" }}>
                {scoreModalSchedule.tournamentName || "Tournament"} • {scoreModalSchedule.round}
              </div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#f0f6fc", marginTop: "4px" }}>
                {scoreModalSchedule.team1Name || "Team 1"} vs {scoreModalSchedule.team2Name || "Team 2"}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                Match Score / Summary *
              </label>
              <input
                type="text"
                value={scoreForm.score}
                onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })}
                placeholder="e.g. 182/4 (20 ov) vs 178/9 (20 ov) or 3 - 1"
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#fbbf24" }}>
                Select Winning Team (Optional)
              </label>
              <select
                value={scoreForm.winnerTeamId}
                onChange={(e) => {
                  const val = e.target.value;
                  let name = "";
                  if (val === String(scoreModalSchedule.team1Id?._id || scoreModalSchedule.team1Id)) {
                    name = scoreModalSchedule.team1Name;
                  } else if (val === String(scoreModalSchedule.team2Id?._id || scoreModalSchedule.team2Id)) {
                    name = scoreModalSchedule.team2Name;
                  }
                  setScoreForm({ ...scoreForm, winnerTeamId: val, winnerName: name });
                }}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  outline: "none"
                }}
              >
                <option value="">-- Match Drawn / Tied / No Winner --</option>
                {scoreModalSchedule.team1Id && (
                  <option value={scoreModalSchedule.team1Id?._id || scoreModalSchedule.team1Id}>
                    👑 Winner: {scoreModalSchedule.team1Name || "Team 1"}
                  </option>
                )}
                {scoreModalSchedule.team2Id && (
                  <option value={scoreModalSchedule.team2Id?._id || scoreModalSchedule.team2Id}>
                    👑 Winner: {scoreModalSchedule.team2Name || "Team 2"}
                  </option>
                )}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                Match Status
              </label>
              <select
                value={scoreForm.status}
                onChange={(e) => setScoreForm({ ...scoreForm, status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  outline: "none"
                }}
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In-Progress / Live</option>
                <option value="scheduled">Scheduled</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => setScoreModalSchedule(null)}
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
                type="submit"
                disabled={scoreLoading}
                style={{
                  padding: "8px 18px",
                  backgroundColor: "#05c7ee",
                  border: "none",
                  borderRadius: "6px",
                  color: "#07131a",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                {scoreLoading ? "Saving..." : "Save Match Result"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================= */}
      {/* DELETE FIXTURE CONFIRMATION MODAL                       */}
      {/* ======================================================= */}
      {deletingSchedule && (
        <Modal
          isOpen={Boolean(deletingSchedule)}
          onClose={() => setDeletingSchedule(null)}
          title="Delete Match Fixture"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                padding: "14px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                display: "flex",
                gap: "12px",
                color: "#fca5a5"
              }}
            >
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Are you sure you want to delete this fixture?</strong>
                <p style={{ margin: "4px 0 0 0", color: "#c9d1d9", fontSize: "12px" }}>
                  Fixture <strong>{deletingSchedule.title}</strong> ({deletingSchedule.scheduleId}) on{" "}
                  {new Date(deletingSchedule.date).toLocaleDateString()} will be removed from all coach and student schedules.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setDeletingSchedule(null)}
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
                Delete Fixture
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminSchedules;