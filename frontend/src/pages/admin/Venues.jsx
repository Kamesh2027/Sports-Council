import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../../components/common/Modal";
import {
  MapPin,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Calendar,
  X,
  Check,
  ShieldCheck,
  Flame,
  Layers
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
  "Volleyball",
  "Multi-Sport / General"
];

const Venues = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [deletingVenue, setDeletingVenue] = useState(null);

  // Form State
  const initialFormState = {
    name: "",
    location: "Main Campus Sports Wing",
    capacity: 500,
    sport: "Multi-Sport / General",
    status: "available"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const token = localStorage.getItem("token");
  const hostname = window.location.hostname || "localhost";
  const API_BASE = `http://${hostname}:5000/api/admin`;

  useEffect(() => {
    loadVenues();
  }, [selectedSport, selectedStatus]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSport && selectedSport !== "All Sports") {
        params.append("sport", selectedSport);
      }
      if (selectedStatus && selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const res = await axios.get(`${API_BASE}/venues?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVenues(res.data.venues || []);
      setStats(
        res.data.stats || {
          total: res.data.venues?.length || 0,
          available: res.data.venues?.filter((v) => v.status === "available").length || 0,
          occupied: res.data.venues?.filter((v) => v.status === "occupied").length || 0,
          maintenance: res.data.venues?.filter((v) => v.status === "maintenance").length || 0
        }
      );
    } catch (err) {
      console.error("Failed to load venues:", err);
      setNotification("Failed to load venues. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingVenue(null);
    setFormData(initialFormState);
    setFormError("");
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name || "",
      location: venue.location || "",
      capacity: venue.capacity || 0,
      sport: venue.sport || "Multi-Sport / General",
      status: venue.status || "available"
    });
    setFormError("");
    setShowAddModal(true);
  };

  // Submit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Venue / facility name is required.");
      return;
    }

    setFormLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (editingVenue) {
        const res = await axios.put(`${API_BASE}/venues/${editingVenue._id}`, formData, { headers });
        setNotification(res.data.message || `Venue '${formData.name}' updated successfully!`);
      } else {
        const res = await axios.post(`${API_BASE}/venues`, formData, { headers });
        setNotification(res.data.message || `Venue '${formData.name}' added successfully!`);
      }

      setShowAddModal(false);
      setTimeout(() => setNotification(""), 4500);
      loadVenues();
    } catch (err) {
      console.error("Save venue error:", err);
      setFormError(err.response?.data?.message || "Failed to save venue. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Quick Status Change
  const handleQuickStatusChange = async (venue, newStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(`${API_BASE}/venues/${venue._id}`, { status: newStatus }, { headers });
      setNotification(`Venue '${venue.name}' marked as '${newStatus}'.`);
      setTimeout(() => setNotification(""), 3500);
      loadVenues();
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  // Delete Venue
  const handleDeleteConfirm = async () => {
    if (!deletingVenue) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.delete(`${API_BASE}/venues/${deletingVenue._id}`, { headers });
      setNotification(res.data.message || "Venue removed successfully.");
      setDeletingVenue(null);
      setTimeout(() => setNotification(""), 4000);
      loadVenues();
    } catch (err) {
      console.error("Delete venue error:", err);
      alert(err.response?.data?.message || "Failed to delete venue.");
    }
  };

  // Filtered venues for search
  const filteredVenues = venues.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.venueId && v.venueId.toLowerCase().includes(q)) ||
      (v.location && v.location.toLowerCase().includes(q)) ||
      (v.sport && v.sport.toLowerCase().includes(q))
    );
  });

  const renderStatusBadge = (status) => {
    const s = (status || "available").toLowerCase();
    switch (s) {
      case "available":
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
            <CheckCircle2 size={12} />
            AVAILABLE
          </span>
        );
      case "occupied":
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "11px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Activity size={12} />
            OCCUPIED / IN USE
          </span>
        );
      case "maintenance":
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
            <AlertTriangle size={12} />
            UNDER MAINTENANCE
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              backgroundColor: "rgba(5, 199, 238, 0.12)",
              color: "#05c7ee",
              fontSize: "11px",
              fontWeight: "700"
            }}
          >
            {status}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#f0f6fc", margin: 0 }}>
              Sports Venues & Facilities
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
              Scheduling Source of Truth
            </span>
          </div>
          <p style={{ color: "#8b949e", marginTop: "4px", fontSize: "14px" }}>
            Add grounds, indoor courts, and sports arenas. Only registered venues here will appear in match scheduling and fixture calendars.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* <button
            onClick={loadVenues}
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
            title="Refresh venues list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button> */}

          <button
            onClick={handleOpenAdd}
            style={{
              padding: "10px 18px",
              backgroundColor: "#05c7ee",
              border: "none",
              borderRadius: "8px",
              color: "#07131a",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 15px rgba(5, 199, 238, 0.3)"
            }}
          >
            <Plus size={16} />
            Add Venue / Facility
          </button>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
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
            <span>TOTAL FACILITIES</span>
            <MapPin size={16} color="#05c7ee" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#f0f6fc", marginTop: "8px" }}>
            {stats.total}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Configured for match scheduling</div>
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
            <span>AVAILABLE VENUES</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#34d399", marginTop: "8px" }}>
            {stats.available}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Ready for fixtures</div>
        </div>

        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "16px",
            borderLeft: "4px solid #f87171"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b949e", fontSize: "12px", fontWeight: "700" }}>
            <span>OCCUPIED / LIVE</span>
            <Activity size={16} color="#f87171" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#f87171", marginTop: "8px" }}>
            {stats.occupied}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Matches ongoing</div>
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
            <span>UNDER MAINTENANCE</span>
            <AlertTriangle size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#fbbf24", marginTop: "8px" }}>
            {stats.maintenance}
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>Temporarily offline</div>
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
        <div style={{ position: "relative", flex: "1 1 250px", minWidth: "220px" }}>
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
            placeholder="Search venue name, location, sport..."
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
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>

        {(selectedSport !== "All Sports" || selectedStatus !== "all" || searchQuery) && (
          <button
            onClick={() => {
              setSelectedSport("All Sports");
              setSelectedStatus("all");
              setSearchQuery("");
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

      {/* VENUES CONTENT */}
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
          <h3 style={{ color: "#f0f6fc", fontSize: "16px", margin: 0 }}>Loading sports venues & grounds...</h3>
        </div>
      ) : filteredVenues.length === 0 ? (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "60px 20px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏟️</div>
          <h3 style={{ fontSize: "18px", color: "#f0f6fc", margin: "0 0 6px 0" }}>No Sports Venues Found</h3>
          <p style={{ color: "#8b949e", fontSize: "14px", maxWidth: "460px", margin: "0 auto 20px auto" }}>
            {venues.length === 0
              ? "You haven't added any sports venues yet. Add your grounds and courts now so they appear in match scheduling."
              : "No venues matched your search and filter criteria."}
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
            + Add First Venue
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* CARDS GRID VIEW */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "18px"
          }}
        >
          {filteredVenues.map((venue) => (
            <div
              key={venue._id}
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
              {/* TOP HEADER */}
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
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={15} color="#05c7ee" />
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#05c7ee" }}>
                    {venue.venueId}
                  </span>
                </div>
                {renderStatusBadge(venue.status)}
              </div>

              {/* CARD BODY */}
              <div style={{ padding: "16px", flex: 1 }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "800",
                    color: "#f0f6fc",
                    margin: "0 0 10px 0"
                  }}
                >
                  {venue.name}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#8b949e" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={14} color="#8b949e" />
                    <span style={{ color: "#c9d1d9" }}>{venue.location || "Campus Ground"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Flame size={14} color="#f59e0b" />
                    <span>Sport: <strong style={{ color: "#f0f6fc" }}>{venue.sport || "General"}</strong></span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users size={14} color="#34d399" />
                    <span>Seating Capacity: <strong style={{ color: "#f0f6fc" }}>{venue.capacity ? `${venue.capacity} spectators` : "Open Field"}</strong></span>
                  </div>
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
                <button
                  type="button"
                  onClick={() => navigate(`/admin/schedules?venue=${encodeURIComponent(venue.name)}`)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "rgba(5, 199, 238, 0.12)",
                    border: "1px solid rgba(5, 199, 238, 0.3)",
                    borderRadius: "6px",
                    color: "#05c7ee",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                  title="View match fixtures at this venue"
                >
                  <Calendar size={12} />
                  Fixtures
                </button>

                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {/* Status switcher dropdown */}
                  <select
                    value={venue.status || "available"}
                    onChange={(e) => handleQuickStatusChange(venue, e.target.value)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#21262d",
                      border: "1px solid #30363d",
                      borderRadius: "4px",
                      color: "#8b949e",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>

                  <button
                    onClick={() => handleOpenEdit(venue)}
                    style={{
                      padding: "5px 8px",
                      backgroundColor: "#21262d",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      color: "#c9d1d9",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                    title="Edit venue details"
                  >
                    <Edit2 size={12} />
                  </button>

                  <button
                    onClick={() => setDeletingVenue(venue)}
                    style={{
                      padding: "5px 8px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "6px",
                      color: "#f87171",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                    title="Delete venue"
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
                  <th style={{ padding: "12px 16px" }}>VENUE ID</th>
                  <th style={{ padding: "12px 16px" }}>VENUE / GROUND NAME</th>
                  <th style={{ padding: "12px 16px" }}>LOCATION</th>
                  <th style={{ padding: "12px 16px" }}>SPORT</th>
                  <th style={{ padding: "12px 16px" }}>CAPACITY</th>
                  <th style={{ padding: "12px 16px" }}>STATUS</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredVenues.map((venue) => (
                  <tr key={venue._id} style={{ borderBottom: "1px solid #21262d" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#05c7ee" }}>
                      {venue.venueId}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <strong style={{ color: "#f0f6fc", display: "block" }}>{venue.name}</strong>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#8b949e" }}>
                      {venue.location || "Main Campus"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#f0f6fc" }}>
                      {venue.sport || "General"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#c9d1d9" }}>
                      {venue.capacity ? `${venue.capacity} seats` : "Open Ground"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {renderStatusBadge(venue.status)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/schedules?venue=${encodeURIComponent(venue.name)}`)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "rgba(5, 199, 238, 0.12)",
                            border: "1px solid rgba(5, 199, 238, 0.3)",
                            borderRadius: "4px",
                            color: "#05c7ee",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: "700"
                          }}
                          title="View fixtures"
                        >
                          Fixtures
                        </button>
                        <button
                          onClick={() => handleOpenEdit(venue)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#21262d",
                            border: "1px solid #30363d",
                            borderRadius: "4px",
                            color: "#c9d1d9",
                            cursor: "pointer",
                            fontSize: "11px"
                          }}
                          title="Edit venue"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setDeletingVenue(venue)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            borderRadius: "4px",
                            color: "#f87171",
                            cursor: "pointer",
                            fontSize: "11px"
                          }}
                          title="Delete venue"
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
      {/* ADD / EDIT VENUE MODAL                                  */}
      {/* ======================================================= */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={editingVenue ? `Edit Venue: ${editingVenue.name}` : "Add New Sports Venue / Facility"}
        >
          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                Venue / Facility Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cricket Ground A, Indoor Stadium Court 1, Athletic Arena"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Campus Location / Block
                </label>
                <input
                  type="text"
                  placeholder="e.g. North Sports Complex, Ground Floor"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  Primary Sport / Purpose
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
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
                  {SPORTS_LIST.filter((s) => s !== "All Sports").map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "700", color: "#c9d1d9" }}>
                  Seating Capacity (Spectators)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
                  Operational Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                  <option value="available">Available for Booking</option>
                  <option value="occupied">Occupied / In Use</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid #21262d", paddingTop: "14px" }}>
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
                disabled={formLoading}
                style={{
                  padding: "9px 20px",
                  backgroundColor: "#05c7ee",
                  border: "none",
                  borderRadius: "6px",
                  color: "#07131a",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {formLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {editingVenue ? "Save Changes" : "Create Venue"}
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================= */}
      {/* DELETE CONFIRMATION MODAL                               */}
      {/* ======================================================= */}
      {deletingVenue && (
        <Modal
          isOpen={Boolean(deletingVenue)}
          onClose={() => setDeletingVenue(null)}
          title={`Delete Venue: ${deletingVenue.name}`}
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
                <strong>Are you sure you want to delete this venue?</strong>
                <p style={{ margin: "4px 0 0 0", color: "#c9d1d9", fontSize: "12px" }}>
                  Venue <strong>{deletingVenue.name}</strong> ({deletingVenue.venueId}) will be removed from the list of available scheduling locations.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setDeletingVenue(null)}
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
                Delete Venue
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Venues;