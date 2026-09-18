import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../../components/common/Modal";
import {
  Dumbbell,
  Search,
  Plus,
  RefreshCw,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight
} from "lucide-react";
import "../../styles/admin.css";

const StudentEquipment = () => {
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestQty, setRequestQty] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  const token = localStorage.getItem("token");
  const hostname = window.location.hostname || "localhost";
  const API_BASE = `http://${hostname}:5000/api`;

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/student/equipment`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setEquipmentList(res.data.equipment || []);
      }
    } catch (err) {
      console.error("Fetch equipment error:", err);
      setError(
        err.response?.data?.message || "Failed to load available equipment catalog."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
    // Default due date to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDueDate(nextWeek.toISOString().split("T")[0]);
  }, []);

  const openRequestModal = (item) => {
    setSelectedItem(item);
    setRequestQty(1);
    setRemarks("");
    setModalSuccess("");
    setModalError("");
    setIsModalOpen(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (requestQty < 1 || requestQty > selectedItem.availableQuantity) {
      setModalError(`Please select a valid quantity between 1 and ${selectedItem.availableQuantity}.`);
      return;
    }

    try {
      setSubmitting(true);
      setModalError("");
      setModalSuccess("");

      const res = await axios.post(
        `${API_BASE}/student/equipment-request`,
        {
          equipmentId: selectedItem._id,
          quantity: Number(requestQty),
          dueDate: dueDate,
          remarks: remarks || "Requested for practice/training"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setModalSuccess(res.data.message || "Equipment request submitted successfully!");
        fetchEquipment();
        setTimeout(() => {
          setIsModalOpen(false);
          navigate("/student/requests");
        }, 1500);
      }
    } catch (err) {
      console.error("Submit request error:", err);
      setModalError(
        err.response?.data?.message || "Failed to submit equipment request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["All", ...new Set(equipmentList.map((i) => i.category || i.sport).filter(Boolean))];

  const filtered = equipmentList.filter((item) => {
    const matchSearch =
      searchQuery === "" ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory =
      categoryFilter === "All" ||
      item.category?.toLowerCase() === categoryFilter.toLowerCase() ||
      item.sport?.toLowerCase() === categoryFilter.toLowerCase();

    return matchSearch && matchCategory;
  });

  return (
    <div className="management-page" style={{ padding: "24px", color: "#c9d1d9" }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#f0f6fc", margin: "0 0 6px" }}>
            Sports Equipment Catalog
          </h1>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            Browse available sports gear and request items for practice or tournament training.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/student/requests")}
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
            My Loan Requests <ArrowRight size={14} />
          </button>

          <button
            onClick={fetchEquipment}
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

      {/* SEARCH AND CATEGORY FILTERS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "9px 14px",
            flex: "1 1 280px"
          }}
        >
          <Search size={16} color="#8da3b5" />
          <input
            type="text"
            placeholder="Search equipment by name, category, or sport..."
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

        {/* CATEGORY PILLS */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                border: "1px solid",
                backgroundColor: categoryFilter === cat ? "#05c7ee" : "#161b22",
                color: categoryFilter === cat ? "#07131a" : "#c9d1d9",
                borderColor: categoryFilter === cat ? "#05c7ee" : "#30363d",
                transition: "all 0.15s ease"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* EQUIPMENT CARDS GRID */}
      {loading ? (
        <div style={{ padding: "50px", textAlign: "center", color: "#8da3b5" }}>
          <RefreshCw size={28} className="animate-spin" style={{ marginBottom: "10px" }} />
          <p>Loading available sports equipment...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "40px",
            textAlign: "center"
          }}
        >
          <Package size={40} style={{ opacity: 0.3, color: "#8da3b5", marginBottom: "10px" }} />
          <h3 style={{ color: "#f0f6fc", margin: "0 0 6px" }}>No Equipment Found</h3>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            No equipment matches your current search filter.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
          {filtered.map((item) => (
            <div
              key={item._id}
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "10px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "border-color 0.2s ease, transform 0.2s ease"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "8px",
                      background: "rgba(5, 199, 238, 0.12)",
                      border: "1px solid rgba(5, 199, 238, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#05c7ee"
                    }}
                  >
                    <Dumbbell size={22} />
                  </div>

                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "700",
                      backgroundColor: item.availableQuantity > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: item.availableQuantity > 0 ? "#34d399" : "#f87171"
                    }}
                  >
                    {item.availableQuantity > 0 ? `${item.availableQuantity} Available` : "Out of Stock"}
                  </span>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f0f6fc", margin: "0 0 4px" }}>
                  {item.name}
                </h3>
                <span style={{ fontSize: "12px", color: "#05c7ee", fontWeight: "600", display: "block", marginBottom: "10px" }}>
                  {item.sport || item.category || "General Gear"}
                </span>

                <div style={{ fontSize: "12px", color: "#8da3b5", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                  <div>Total Units: <strong style={{ color: "#c9d1d9" }}>{item.totalQuantity || item.availableQuantity}</strong></div>
                  <div>Condition: <strong style={{ color: "#34d399" }}>{item.condition || "Good / Ready"}</strong></div>
                </div>
              </div>

              <button
                disabled={item.availableQuantity <= 0}
                onClick={() => openRequestModal(item)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: item.availableQuantity > 0 ? "#05c7ee" : "#21262d",
                  color: item.availableQuantity > 0 ? "#07131a" : "#8da3b5",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: item.availableQuantity > 0 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <Plus size={16} /> Request Gear
              </button>
            </div>
          ))}
        </div>
      )}

      {/* REQUEST EQUIPMENT MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedItem ? `Request ${selectedItem.name}` : "Request Sports Equipment"}
        >
          <form onSubmit={handleRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {modalError && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "6px", color: "#f87171", fontSize: "13px" }}>
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", borderRadius: "6px", color: "#34d399", fontSize: "13px" }}>
                {modalSuccess}
              </div>
            )}

            {selectedItem && (
              <div style={{ background: "#161b22", padding: "14px", borderRadius: "8px", border: "1px solid #30363d" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ color: "#f0f6fc", fontSize: "14px" }}>{selectedItem.name}</strong>
                  <span style={{ color: "#05c7ee", fontSize: "12px", fontWeight: "700" }}>{selectedItem.sport || selectedItem.category}</span>
                </div>
                <div style={{ color: "#8da3b5", fontSize: "12px" }}>
                  Available stock: <strong style={{ color: "#34d399" }}>{selectedItem.availableQuantity} units</strong>
                </div>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#8da3b5", marginBottom: "6px", fontWeight: "600" }}>
                Quantity Needed *
              </label>
              <input
                type="number"
                min="1"
                max={selectedItem?.availableQuantity || 1}
                value={requestQty}
                onChange={(e) => setRequestQty(Math.max(1, parseInt(e.target.value) || 1))}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#8da3b5", marginBottom: "6px", fontWeight: "600" }}>
                Expected Return Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#8da3b5", marginBottom: "6px", fontWeight: "600" }}>
                Purpose / Training Remarks (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Required for varsity squad weekend scrimmage..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "13px",
                  outline: "none",
                  resize: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#c9d1d9",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#05c7ee",
                  border: "none",
                  borderRadius: "6px",
                  color: "#07131a",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: submitting ? "not-allowed" : "pointer"
                }}
              >
                {submitting ? "Submitting..." : "Submit Loan Request"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentEquipment;
