import { useState } from "react";
import adminService from "../../services/adminService";
import { User, Mail, Phone, Award, Shield, Check, AlertCircle, Users, Trophy } from "lucide-react";

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

const CoachForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    coachId: "",
    contactNumber: "",
    email: "",
    gender: "Male",
    sport: "General Athletics",
    teamName: "Athletics Team",
    password: "Coach@123"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [teamNameManuallyEdited, setTeamNameManuallyEdited] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-update team name if user hasn't manually customized it
      if (name === "sport" && !teamNameManuallyEdited) {
        updated.teamName = `${value} Team`;
      }

      return updated;
    });
    setError("");
  };

  const handleTeamNameChange = (e) => {
    setTeamNameManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      teamName: e.target.value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.name.trim() || !formData.coachId.trim() || !formData.email.trim()) {
      setError("Please fill in Coach Name, Coach ID, and Email Address.");
      return;
    }

    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber.trim())) {
      setError("Contact number must be a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        coachId: formData.coachId.trim().toUpperCase(),
        contactNumber: formData.contactNumber.trim(),
        phone: formData.contactNumber.trim(),
        email: formData.email.trim().toLowerCase(),
        gender: formData.gender,
        sport: formData.sport,
        teamName: formData.teamName.trim() || `${formData.sport} Team`,
        password: formData.password || "Coach@123"
      };

      const res = await adminService.addCoach(payload);

      setSuccessMsg(res.message || "Coach registered successfully!");
      setTimeout(() => {
        if (onSuccess) onSuccess(res.coach);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to add coach");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {error && (
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
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: "10px 14px",
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
          <Check size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {/* Full Name */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
            Coach Name <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Robert Smith"
            value={formData.name}
            onChange={handleChange}
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

        {/* Coach ID */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
            Coach ID <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            type="text"
            name="coachId"
            placeholder="e.g. COACH002"
            value={formData.coachId}
            onChange={handleChange}
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
              textTransform: "uppercase",
              boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {/* Email */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
            Email Address <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="coach@bitsathy.ac.in"
            value={formData.email}
            onChange={handleChange}
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

        {/* Contact Number */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
            Contact Number (10 digits)
          </label>
          <input
            type="tel"
            name="contactNumber"
            placeholder="9876543210"
            maxLength={10}
            value={formData.contactNumber}
            onChange={handleChange}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {/* Gender */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
            Gender <span style={{ color: "#f87171" }}>*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#f0f6fc",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
              cursor: "pointer"
            }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Specialized Sport */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
            Sport / Discipline <span style={{ color: "#f87171" }}>*</span>
          </label>
          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#f0f6fc",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
              cursor: "pointer"
            }}
          >
            {SPORTS_LIST.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assigned Team Name */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
          Assigned Team / Squad Name <span style={{ color: "#f87171" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            name="teamName"
            placeholder="e.g. BIT Athletics Squad, Phoenix Warriors"
            value={formData.teamName}
            onChange={handleTeamNameChange}
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
        <span style={{ fontSize: "11px", color: "#6e7681", marginTop: "4px", display: "block" }}>
          Specify the team squad name assigned to this coach.
        </span>
      </div>

      {/* Initial Password */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#8da3b5", marginBottom: "6px" }}>
          Initial Login Password
        </label>
        <input
          type="text"
          name="password"
          placeholder="Default: Coach@123"
          value={formData.password}
          onChange={handleChange}
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
        <span style={{ fontSize: "11px", color: "#6e7681", marginTop: "4px", display: "block" }}>
          The coach will use this password to sign in to the Coach Portal.
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
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
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 22px",
            backgroundColor: "#238636",
            border: "none",
            borderRadius: "6px",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Registering Coach..." : "Register Coach"}
        </button>
      </div>
    </form>
  );
};

export default CoachForm;