import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  UserRound,
  Mail,
  Phone,
  GraduationCap,
  Trophy,
  ShieldCheck,
  Calendar,
  Dumbbell,
  RefreshCw,
  Award
} from "lucide-react";
import "../../styles/admin.css";

const StudentProfile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const hostname = window.location.hostname || "localhost";
  const API_BASE = `http://${hostname}:5000/api`;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/student/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setProfile(res.data.student);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError(
        err.response?.data?.message || "Failed to load student athlete profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const studentName = profile?.name || user?.name || "Student Athlete";
  const studentId = profile?.studentId || user?.userId || "STUDENT";
  const email = profile?.email || user?.email || "-";
  const registerNumber = profile?.registerNumber || "-";
  const department = profile?.department || "General";
  const year = profile?.year || 1;
  const coach = profile?.coachId;
  const sport = coach?.sport || "Athletics";

  return (
    <div className="management-page" style={{ padding: "24px", color: "#c9d1d9" }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#f0f6fc", margin: "0 0 6px" }}>
            Student Athlete Profile
          </h1>
          <p style={{ color: "#8da3b5", fontSize: "13px", margin: 0 }}>
            Official sports identity and academic affiliation records.
          </p>
        </div>

        <button
          onClick={fetchProfile}
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

      {/* ATHLETE IDENTITY HEADER CARD */}
      <div
        style={{
          background: "linear-gradient(135deg, #161b22 0%, #0d1117 100%)",
          border: "1px solid #30363d",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(5, 199, 238, 0.25) 0%, rgba(5, 199, 238, 0.05) 100%)",
            border: "2px solid #05c7ee",
            color: "#05c7ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "800",
            boxShadow: "0 0 16px rgba(5, 199, 238, 0.3)"
          }}
        >
          {studentName.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#f0f6fc", margin: 0 }}>
              {studentName}
            </h2>
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
              ✓ Official Athlete
            </span>
          </div>

          <p style={{ color: "#8da3b5", margin: "6px 0 0", fontSize: "13px" }}>
            Athlete ID: <strong style={{ color: "#05c7ee" }}>{studentId}</strong> • Register No:{" "}
            <strong style={{ color: "#f0f6fc" }}>{registerNumber}</strong> • Sport:{" "}
            <strong style={{ color: "#f0f6fc" }}>{sport}</strong>
          </p>
        </div>
      </div>

      {/* PROFILE DETAILS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* ACADEMIC DETAILS */}
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "10px", padding: "20px", borderLeft: "4px solid #05c7ee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <GraduationCap size={20} color="#05c7ee" />
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#f0f6fc", margin: 0 }}>
              Academic & College Information
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
              <span style={{ color: "#8da3b5" }}>Institution:</span>
              <strong style={{ color: "#f0f6fc" }}>Bannari Amman Institute of Tech</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
              <span style={{ color: "#8da3b5" }}>Department:</span>
              <strong style={{ color: "#f0f6fc" }}>{department}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
              <span style={{ color: "#8da3b5" }}>Current Year of Study:</span>
              <strong style={{ color: "#05c7ee" }}>Year {year}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8da3b5" }}>Register Number:</span>
              <strong style={{ color: "#c9d1d9" }}>{registerNumber}</strong>
            </div>
          </div>
        </div>

        {/* CONTACT & ACCOUNT DETAILS */}
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "10px", padding: "20px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <UserRound size={20} color="#10b981" />
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#f0f6fc", margin: 0 }}>
              Contact & Account Info
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
              <span style={{ color: "#8da3b5" }}>College Email:</span>
              <strong style={{ color: "#c9d1d9" }}>{email}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
              <span style={{ color: "#8da3b5" }}>Phone Number:</span>
              <strong style={{ color: "#c9d1d9" }}>{profile?.phone || "Not Provided"}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", paddingBottom: "8px" }}>
              <span style={{ color: "#8da3b5" }}>Account Role:</span>
              <strong style={{ color: "#34d399" }}>Student Athlete</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8da3b5" }}>Active Equipment Loans:</span>
              <strong style={{ color: "#05c7ee" }}>{profile?.activeIssuedLoans || 0} items in hand</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
