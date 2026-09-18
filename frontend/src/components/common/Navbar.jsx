import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Sun,
  Moon,
  UserCircle,
  GraduationCap,
  Mail,
  Phone,
  Shield,
  Trophy,
  X,
  ArrowRight,
  LogOut
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const popupRef = useRef(null);

  // Close popup on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPopupOpen(false);
      }
    };
    if (isPopupOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPopupOpen]);

  // Fetch student profile details for the contact info popup
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.role === "student") {
        try {
          setLoadingProfile(true);
          const token = localStorage.getItem("token");
          const hostname = window.location.hostname || "localhost";
          const res = await axios.get(`http://${hostname}:5000/api/student/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setProfileData(res.data.student);
          }
        } catch (err) {
          console.warn("Could not load student profile in navbar:", err.message);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const isStudent = user?.role === "student";
  const isCoach = user?.role === "coach";
  const isAdmin = user?.role === "admin";
  const isStudentOrCoach = isStudent || isCoach;

  const displayName = isStudent
    ? (profileData?.name || user?.name || "Student Athlete")
    : isCoach
      ? (user?.name || "Sports Coach")
      : (user?.name || "Sports Council Admin");

  const displayEmail = isStudent
    ? (profileData?.email || user?.email || "student@bitsathy.ac.in")
    : (user?.email || "coach@bitsathy.ac.in");

  const displayId = isStudent
    ? (profileData?.registerNumber || user?.registerNumber || "7376231EC001")
    : (user?.coachId || user?.registerNumber || "COACH-01");

  const displayDept = isStudent
    ? (profileData?.department || "ECE - Electronics & Communication Engineering")
    : (user?.sport ? `${user.sport} Department` : (user?.department || "Physical Education Department"));

  const displayYear = profileData?.year || 4;
  const displayPhone = isStudent ? (profileData?.phone || "0636953840") : (user?.phone || "0636953840");
  const coachName = profileData?.coachId?.name || "Sports Coach";
  const roleDisplay = isStudent ? "STUDENT" : isCoach ? "COACH" : (user?.role?.toUpperCase() || "ADMIN");

  return (
    <header className="topbar">
      {/* SEARCH CONTAINER */}
      <div className="search-container">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search athletes, teams, or events..."
        />
      </div>

      {/* TOPBAR ACTIONS */}
      <div className="topbar-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* THEME TOGGLE BUTTON */}
        {/* <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          aria-label="Toggle theme"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "20px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
            transition: "all 0.2s ease"
          }}
        >
          {isDark ? (
            <>
              <Sun size={15} color="#f59e0b" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#0284c7" />
              <span>Dark</span>
            </>
          )}
        </button> */}

        {/* NOTIFICATIONS */}
        {/* <button className="icon-btn" title="Notifications">
          <Bell size={18} />
        </button> */}

        {/* USER ROLE BADGE & CONTACT INFO LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "4px" }}>
          {/* ROLE BADGE NEAR LOGO */}
          <div
            style={{
              padding: "4px 10px",
              borderRadius: "14px",
              backgroundColor: isStudent
                ? "rgba(5, 199, 238, 0.15)"
                : isCoach
                  ? "rgba(56, 189, 248, 0.15)"
                  : "rgba(16, 185, 129, 0.15)",
              border: `1px solid ${
                isStudent
                  ? "rgba(5, 199, 238, 0.35)"
                  : isCoach
                    ? "rgba(56, 189, 248, 0.35)"
                    : "rgba(16, 185, 129, 0.35)"
              }`,
              color: isStudent ? "#05c7ee" : isCoach ? "#38bdf8" : "#34d399",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: isStudent ? "#05c7ee" : isCoach ? "#38bdf8" : "#34d399",
                display: "inline-block"
              }}
            />
            {roleDisplay}
          </div>

          {/* USER NAME */}
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
            {displayName}
          </span>

          {/* CONTACT INFORMATION LOGO (STUDENT & COACH ONLY) */}
          {isStudentOrCoach && (
            <button
              type="button"
              onClick={() => setIsPopupOpen((prev) => !prev)}
              title="Click to view contact and college credentials"
              style={{
                background: isPopupOpen ? "var(--accent-cyan-dim)" : "transparent",
                border: isPopupOpen ? "1.5px solid var(--accent-cyan)" : "1.5px solid var(--border-color)",
                borderRadius: "50%",
                padding: "2px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isPopupOpen ? "var(--accent-cyan)" : "var(--text-primary)",
                transition: "all 0.15s ease",
                boxShadow: isPopupOpen ? "0 0 12px rgba(5, 199, 238, 0.4)" : "none"
              }}
            >
              <UserCircle size={30} strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* =====================================================
            CENTERED BLURRED MODAL POPUP FOR PROFILE & CONTACT INFO (STUDENT & COACH ONLY)
        ===================================================== */}
        {isStudentOrCoach && isPopupOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              padding: "20px"
            }}
            onClick={() => setIsPopupOpen(false)}
          >
            <div
              ref={popupRef}
              style={{
                width: "100%",
                maxWidth: "480px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "16px",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
                overflow: "hidden",
                position: "relative",
                zIndex: 100000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div
                style={{
                  padding: "18px 22px",
                  background: "var(--bg-elevated)",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "var(--accent-cyan-dim)",
                      border: "2px solid var(--accent-cyan)",
                      color: "var(--accent-cyan)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "800",
                      boxShadow: "0 0 12px rgba(5, 199, 238, 0.3)"
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>
                      {displayName}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 7px",
                          borderRadius: "10px",
                          backgroundColor: isStudent ? "rgba(5, 199, 238, 0.15)" : "rgba(56, 189, 248, 0.15)",
                          color: isStudent ? "#05c7ee" : "#38bdf8",
                          fontWeight: "700"
                        }}
                      >
                        {roleDisplay}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                        ID: {displayId}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPopupOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* MODAL BODY */}
              <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* 1. ACADEMIC & COLLEGE / DEPARTMENT INFORMATION */}
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-color)",
                    borderLeft: "4px solid #05c7ee",
                    borderRadius: "10px",
                    padding: "14px 16px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--accent-cyan)" }}>
                    <GraduationCap size={18} />
                    <strong style={{ fontSize: "13px", letterSpacing: "0.3px" }}>
                      {isStudent ? "Academic & College Information" : "Department & Role Information"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Institution:</span>
                      <strong style={{ color: "var(--text-primary)", textAlign: "right", maxWidth: "220px" }}>
                        Bannari Amman Institute of Technology
                      </strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--text-muted)" }}>{isStudent ? "Department:" : "Sport / Dept:"}</span>
                      <strong style={{ color: "var(--text-primary)", textAlign: "right", maxWidth: "220px" }}>
                        {displayDept}
                      </strong>
                    </div>

                    {isStudent ? (
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Current Year of Study:</span>
                        <strong style={{ color: "var(--accent-cyan)" }}>Year {displayYear}</strong>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Designation:</span>
                        <strong style={{ color: "var(--accent-cyan)" }}>Head Coach / Physical Director</strong>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>{isStudent ? "Register Number:" : "Coach ID:"}</span>
                      <strong style={{ color: "var(--text-primary)" }}>{displayId}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. CONTACT INFORMATION */}
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-color)",
                    borderLeft: "4px solid #10b981",
                    borderRadius: "10px",
                    padding: "14px 16px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--accent-green)" }}>
                    <Mail size={16} />
                    <strong style={{ fontSize: "13px", letterSpacing: "0.3px" }}>
                      Contact Information
                    </strong>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--text-muted)" }}>College Email:</span>
                      <strong style={{ color: "var(--text-primary)", wordBreak: "break-all", textAlign: "right" }}>
                        {displayEmail}
                      </strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: coachName && isStudent ? "1px solid var(--border-subtle)" : "none", paddingBottom: coachName && isStudent ? "8px" : 0 }}>
                      <span style={{ color: "var(--text-muted)" }}>Phone Number:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{displayPhone}</strong>
                    </div>

                    {isStudent && coachName && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Assigned Coach:</span>
                        <strong style={{ color: "var(--accent-green)" }}>{coachName}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* MODAL FOOTER ACTIONS */}
                {/* <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  {user?.role === "student" && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPopupOpen(false);
                        navigate("/student/profile");
                      }}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        backgroundColor: "var(--accent-cyan)",
                        color: isDark ? "#07131a" : "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      View Full Profile <ArrowRight size={14} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsPopupOpen(false);
                      logout();
                      navigate("/login");
                    }}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--accent-red)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
