import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../components/common/Modal";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Share2,
  AlertCircle,
  Check,
  Trophy,
  ShieldCheck,
  Wrench,
  Layers
} from "lucide-react";

const SPORTS_LIST = [
  "General Athletics",
  "Badminton",
  "Basketball",
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

const CATEGORIES = [
  "Balls & Inflatables",
  "Protective & Safety Gear",
  "Rackets, Bats & Sticks",
  "Apparel, Kits & Footwear",
  "Field & Court Equipment",
  "Fitness & Training Aids",
  "Timing & Scoring Devices",
  "General Gear"
];

const Equipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [assigningItem, setAssigningItem] = useState(null);

  // Add / Edit Form state
  const [formData, setFormData] = useState({
    name: "",
    equipmentId: "",
    category: "Balls & Inflatables",
    sport: "General Athletics",
    totalQuantity: 10,
    availableQuantity: 10,
    damagedQuantity: 0,
    status: "available",
    targetTeamId: "",
    assignedQuantity: 0
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Assign to Team Form state
  const [assignTeamId, setAssignTeamId] = useState("");
  const [assignQty, setAssignQty] = useState(1);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");

  const token = localStorage.getItem("token");

  // Load equipment & teams
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [equipRes, teamsRes] = await Promise.allSettled([
        axios.get("http://localhost:5000/api/admin/equipment", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/admin/teams", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (equipRes.status === "fulfilled") {
        setEquipmentList(equipRes.value.data.equipment || []);
      } else {
        throw new Error(equipRes.reason?.response?.data?.message || "Failed to load equipment.");
      }

      if (teamsRes.status === "fulfilled") {
        setTeamsList(teamsRes.value.data.teams || []);
      }
    } catch (err) {
      console.error("Equipment load error:", err);
      setError(err.message || "Failed to load equipment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      equipmentId: "",
      category: "Balls & Inflatables",
      sport: "General Athletics",
      totalQuantity: 10,
      availableQuantity: 10,
      damagedQuantity: 0,
      status: "available",
      targetTeamId: teamsList.length > 0 ? teamsList[0]._id : "",
      assignedQuantity: 0
    });
    setFormError("");
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      equipmentId: item.equipmentId,
      category: item.category || "General Gear",
      sport: item.sport || "General Athletics",
      totalQuantity: item.totalQuantity || 0,
      availableQuantity: item.availableQuantity ?? item.totalQuantity ?? 0,
      damagedQuantity: item.damagedQuantity || 0,
      status: item.status || "available",
      targetTeamId: "",
      assignedQuantity: 0
    });
    setFormError("");
    setShowAddModal(true);
  };

  // Open Assign to Team Modal
  const handleOpenAssign = (item) => {
    setAssigningItem(item);
    setAssignTeamId(teamsList.length > 0 ? teamsList[0]._id : "");
    setAssignQty(1);
    setAssignError("");
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Please provide an Equipment Name.");
      return;
    }

    if (Number(formData.totalQuantity) < 0) {
      setFormError("Total quantity must be a non-negative number.");
      return;
    }

    setFormLoading(true);

    try {
      if (editingItem) {
        // Update existing item
        const res = await axios.put(
          `http://localhost:5000/api/admin/equipment/${editingItem._id || editingItem.equipmentId}`,
          {
            name: formData.name.trim(),
            category: formData.category,
            sport: formData.sport,
            totalQuantity: Number(formData.totalQuantity),
            availableQuantity: Number(formData.availableQuantity),
            damagedQuantity: Number(formData.damagedQuantity),
            status: formData.status
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotification(res.data.message || "Equipment updated successfully!");
      } else {
        // Create new item
        const res = await axios.post(
          "http://localhost:5000/api/admin/equipment",
          {
            name: formData.name.trim(),
            equipmentId: formData.equipmentId.trim(),
            category: formData.category,
            sport: formData.sport,
            totalQuantity: Number(formData.totalQuantity),
            availableQuantity: Number(formData.availableQuantity),
            damagedQuantity: Number(formData.damagedQuantity),
            status: formData.status,
            targetTeamId: formData.targetTeamId || null,
            assignedQuantity: Number(formData.assignedQuantity) || 0
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotification(res.data.message || "Equipment added to inventory successfully!");
      }

      setShowAddModal(false);
      setTimeout(() => setNotification(""), 4000);
      loadData();
    } catch (err) {
      console.error("Save equipment error:", err);
      setFormError(err.response?.data?.message || err.message || "Failed to save equipment.");
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Assign to Team
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignError("");

    if (!assignTeamId) {
      setAssignError("Please select a target team.");
      return;
    }

    if (Number(assignQty) < 1) {
      setAssignError("Quantity must be at least 1.");
      return;
    }

    if (assigningItem && Number(assignQty) > (assigningItem.availableQuantity || 0)) {
      setAssignError(`Only ${assigningItem.availableQuantity} units available.`);
      return;
    }

    setAssignLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/equipment/assign-team",
        {
          teamId: assignTeamId,
          equipmentId: assigningItem._id || assigningItem.equipmentId,
          quantity: Number(assignQty)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification(res.data.message || "Equipment assigned to squad successfully!");
      setAssigningItem(null);
      setTimeout(() => setNotification(""), 4000);
      loadData();
    } catch (err) {
      console.error("Assign equipment error:", err);
      setAssignError(err.response?.data?.message || err.message || "Failed to assign equipment to team.");
    } finally {
      setAssignLoading(false);
    }
  };

  // Delete Equipment
  const handleDeleteEquipment = async (item) => {
    if (!window.confirm(`Are you sure you want to delete '${item.name}' (${item.equipmentId}) from inventory?`)) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/equipment/${item._id || item.equipmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification(`Equipment '${item.name}' was removed.`);
      setTimeout(() => setNotification(""), 4000);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete equipment.");
    }
  };

  // Filtered Equipment List
  const filteredEquipment = equipmentList.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.equipmentId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sport || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSport =
      selectedSport === "all" ||
      (item.sport || "").toLowerCase() === selectedSport.toLowerCase();

    const matchesCategory =
      selectedCategory === "all" ||
      (item.category || "").toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === "all" ||
      (item.status || "available").toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesSport && matchesCategory && matchesStatus;
  });

  // Calculate Metrics
  const totalUnits = equipmentList.reduce((acc, item) => acc + (item.totalQuantity || 0), 0);
  const availableUnits = equipmentList.reduce((acc, item) => acc + (item.availableQuantity || 0), 0);
  const damagedUnits = equipmentList.reduce((acc, item) => acc + (item.damagedQuantity || 0), 0);
  const sportsCount = Array.from(new Set(equipmentList.map((item) => item.sport).filter(Boolean))).length;

  return (
    <div className="management-page">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, fontSize: "22px" }}>
            <Package size={24} color="#05c7ee" />
            Equipment Inventory & Allocation
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#8da3b5", fontSize: "13px" }}>
            Manage sports equipment stock, monitor available units, record damaged gear, and assign supplies to squads.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="primary-btn"
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
              cursor: "pointer"
            }}
          >
            <Plus size={18} />
            ADD EQUIPMENT
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {notification && (
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
          <span>{notification}</span>
        </div>
      )}

      {/* Quick Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "14px",
          margin: "16px 0"
        }}
      >
        {/* Total Stock */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>TOTAL UNITS IN STOCK</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>{totalUnits}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>{equipmentList.length} unique items</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5, 199, 238, 0.1)", color: "#05c7ee" }}>
            <Package size={24} />
          </div>
        </div>

        {/* Available Units */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>AVAILABLE TO ISSUE</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#4ade80" }}>{availableUnits}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Ready for athletes & teams</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
            <Check size={24} />
          </div>
        </div>

        {/* Damaged / In Repair */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>DAMAGED / MAINTENANCE</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: damagedUnits > 0 ? "#f87171" : "#f0f6fc" }}>
              {damagedUnits}
            </h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Requires service / replacement</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#f87171" }}>
            <Wrench size={24} />
          </div>
        </div>

        {/* Disciplines */}
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>ACTIVE SPORTS</span>
            <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>{sportsCount || 1}</h2>
            <span style={{ fontSize: "11px", color: "#6e7681" }}>Covering all campus sports</span>
          </div>
          <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
            <Trophy size={24} />
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6e7681" }} />
            <input
              type="text"
              placeholder="Search equipment, ID, category..."
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

          {/* Sport Dropdown */}
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
            <option value="all">All Sports</option>
            {SPORTS_LIST.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <button
          onClick={loadData}
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
          title="Refresh equipment list"
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Equipment Table Card */}
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
            Equipment Inventory Items ({filteredEquipment.length})
          </h2>
        </div>

        <div className="management-card-body" style={{ padding: "0" }}>
          {loading ? (
            <div className="empty-state" style={{ padding: "40px" }}>
              <div className="dashboard-loading">Loading equipment inventory...</div>
            </div>
          ) : error ? (
            <div className="empty-state" style={{ padding: "40px" }}>
              <h3 style={{ color: "#f87171" }}>Unable to load equipment</h3>
              <p>{error}</p>
              <button className="primary-btn" onClick={loadData} style={{ marginTop: "12px" }}>
                Try Again
              </button>
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="empty-state" style={{ padding: "50px 20px", textAlign: "center" }}>
              <Package size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
              <h3>No Equipment Found</h3>
              <p style={{ color: "#8da3b5", maxWidth: "420px", margin: "0 auto 16px auto" }}>
                {searchQuery || selectedSport !== "all" || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "No items match your active search or filter criteria."
                  : "No sports equipment has been recorded in the inventory yet."}
              </p>
              <button
                className="primary-btn"
                onClick={handleOpenAdd}
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
                + Add First Equipment Item
              </button>
            </div>
          ) : (
            <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#14181e", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>EQUIPMENT ITEM</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>EQUIPMENT ID</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>SPORT & CATEGORY</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>TOTAL QTY</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>AVAILABLE</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>DAMAGED</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>STATUS</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEquipment.map((item) => {
                    const isOutOfStock = (item.availableQuantity ?? 0) === 0;
                    return (
                      <tr
                        key={item._id || item.equipmentId}
                        style={{
                          borderBottom: "1px solid #21262d",
                          transition: "background-color 0.15s"
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#161b22")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        {/* Name & Icon */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                backgroundColor: "rgba(5, 199, 238, 0.15)",
                                color: "#05c7ee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "700",
                                fontSize: "16px"
                              }}
                            >
                              ⚽
                            </div>
                            <div>
                              <strong style={{ color: "#f0f6fc", fontSize: "13px", display: "block" }}>
                                {item.name}
                              </strong>
                              <span style={{ fontSize: "11px", color: "#8b949e" }}>
                                {item.category || "General Gear"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Equipment ID */}
                        <td style={{ padding: "14px 16px" }}>
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
                            {item.equipmentId}
                          </span>
                        </td>

                        {/* Sport & Category */}
                        <td style={{ padding: "14px 16px" }}>
                          <div>
                            <span
                              style={{
                                padding: "3px 8px",
                                backgroundColor: "rgba(234, 179, 8, 0.15)",
                                border: "1px solid rgba(234, 179, 8, 0.3)",
                                borderRadius: "4px",
                                color: "#facc15",
                                fontSize: "11px",
                                fontWeight: "600",
                                display: "inline-block",
                                marginBottom: "3px"
                              }}
                            >
                              {item.sport || "General"}
                            </span>
                          </div>
                        </td>

                        {/* Total Quantity */}
                        <td style={{ padding: "14px 16px", color: "#f0f6fc", fontWeight: "700", fontSize: "13px" }}>
                          {item.totalQuantity || 0}
                        </td>

                        {/* Available Quantity */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "10px",
                              fontSize: "12px",
                              fontWeight: "700",
                              backgroundColor: isOutOfStock ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                              color: isOutOfStock ? "#f87171" : "#4ade80"
                            }}
                          >
                            {item.availableQuantity ?? item.totalQuantity ?? 0}
                          </span>
                        </td>

                        {/* Damaged Quantity */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              color: (item.damagedQuantity || 0) > 0 ? "#f87171" : "#6e7681",
                              fontWeight: (item.damagedQuantity || 0) > 0 ? "700" : "normal",
                              fontSize: "12px"
                            }}
                          >
                            {item.damagedQuantity || 0}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            className={`status-badge ${
                              item.status === "available"
                                ? "success"
                                : item.status === "maintenance"
                                ? "warning"
                                : "danger"
                            }`}
                          >
                            {item.status || "available"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            {/* Assign to Team Button */}
                            <button
                              onClick={() => handleOpenAssign(item)}
                              title="Assign to Squad / Team"
                              style={{
                                padding: "6px 8px",
                                backgroundColor: "rgba(5, 199, 238, 0.1)",
                                border: "1px solid rgba(5, 199, 238, 0.3)",
                                borderRadius: "4px",
                                color: "#05c7ee",
                                fontSize: "11px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Share2 size={13} />
                              Assign
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Equipment"
                              style={{
                                padding: "6px 8px",
                                backgroundColor: "rgba(56, 189, 248, 0.1)",
                                border: "1px solid rgba(56, 189, 248, 0.25)",
                                borderRadius: "4px",
                                color: "#38bdf8",
                                fontSize: "11px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteEquipment(item)}
                              title="Delete from Inventory"
                              style={{
                                padding: "6px 8px",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "4px",
                                color: "#f87171",
                                fontSize: "11px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center"
                              }}
                            >
                              <Trash2 size={13} />
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

      {/* MODAL 1: ADD / EDIT EQUIPMENT */}
      {showAddModal && (
        <Modal
          title={editingItem ? `Edit Equipment: ${editingItem.name}` : "Add Sports Equipment to Inventory"}
          onClose={() => setShowAddModal(false)}
          maxWidth="560px"
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

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px" }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Equipment Name <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Match Football, Cricket Bat"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
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

              {/* Equipment ID */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Equipment ID
                </label>
                <input
                  type="text"
                  placeholder="Auto (e.g. EQ001)"
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    outline: "none",
                    textTransform: "uppercase",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* Sport */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Sport Discipline <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  {SPORTS_LIST.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Category <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#f0f6fc",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantities */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {/* Total Qty */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Total Quantity <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalQuantity}
                  onChange={(e) => {
                    const total = Math.max(0, Number(e.target.value));
                    setFormData({
                      ...formData,
                      totalQuantity: total,
                      availableQuantity: Math.max(0, total - (formData.damagedQuantity || 0))
                    });
                  }}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
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

              {/* Available Qty */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Available Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.availableQuantity}
                  onChange={(e) => setFormData({ ...formData, availableQuantity: Math.max(0, Number(e.target.value)) })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
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

              {/* Damaged Qty */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                  Damaged / Repair
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.damagedQuantity}
                  onChange={(e) => {
                    const damaged = Math.max(0, Number(e.target.value));
                    setFormData({
                      ...formData,
                      damagedQuantity: damaged,
                      availableQuantity: Math.max(0, (formData.totalQuantity || 0) - damaged)
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
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
            </div>

            {/* Status */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <option value="available">Available (In Stock)</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>

            {/* Direct Assignment to Team (Only for New Items) */}
            {!editingItem && teamsList.length > 0 && (
              <div style={{ padding: "12px", backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#05c7ee", display: "block", marginBottom: "8px" }}>
                  Optional: Assign Initial Batch Directly to a Squad / Team
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "10px" }}>
                  <select
                    value={formData.targetTeamId}
                    onChange={(e) => setFormData({ ...formData, targetTeamId: e.target.value })}
                    style={{
                      padding: "8px 10px",
                      backgroundColor: "#161b22",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      color: "#f0f6fc",
                      fontSize: "12px"
                    }}
                  >
                    <option value="">Do not assign yet</option>
                    {teamsList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.sport})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    max={formData.availableQuantity || formData.totalQuantity}
                    placeholder="Units to assign"
                    value={formData.assignedQuantity || ""}
                    onChange={(e) => setFormData({ ...formData, assignedQuantity: Math.max(0, Number(e.target.value)) })}
                    style={{
                      padding: "8px 10px",
                      backgroundColor: "#161b22",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      color: "#f0f6fc",
                      fontSize: "12px"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={formLoading}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  padding: "10px 22px",
                  backgroundColor: "#238636",
                  border: "none",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: formLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: formLoading ? 0.7 : 1
                }}
              >
                {formLoading ? "Saving..." : editingItem ? "Save Changes" : "Add Equipment"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: ASSIGN EQUIPMENT TO TEAM */}
      {assigningItem && (
        <Modal
          title={`Assign '${assigningItem.name}' to Team / Squad`}
          onClose={() => setAssigningItem(null)}
          maxWidth="480px"
        >
          <form onSubmit={handleAssignSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {assignError && (
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
                <span>{assignError}</span>
              </div>
            )}

            <div style={{ padding: "10px 14px", backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", color: "#8da3b5" }}>Available Stock:</span>
              <strong style={{ color: "#4ade80", fontSize: "14px", marginLeft: "8px" }}>
                {assigningItem.availableQuantity || 0} Units
              </strong>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Select Target Team / Squad <span style={{ color: "#f87171" }}>*</span>
              </label>
              <select
                value={assignTeamId}
                onChange={(e) => setAssignTeamId(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                {teamsList.length === 0 ? (
                  <option value="">No teams found</option>
                ) : (
                  teamsList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.sport}) — Coach: {t.coachId?.name || "Unassigned"}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
                Quantity to Assign <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max={assigningItem.availableQuantity || 1}
                value={assignQty}
                onChange={(e) => setAssignQty(Math.max(1, Number(e.target.value)))}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setAssigningItem(null)}
                disabled={assignLoading}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assignLoading || (assigningItem.availableQuantity || 0) === 0}
                style={{
                  padding: "10px 22px",
                  backgroundColor: "#05c7ee",
                  border: "none",
                  borderRadius: "6px",
                  color: "#07131a",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: assignLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: assignLoading ? 0.7 : 1
                }}
              >
                {assignLoading ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Equipment;