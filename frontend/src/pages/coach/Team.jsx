import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Package, Shield, Trophy } from "lucide-react";

const Team = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/coach/team",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTeam(response.data.team || null);
    } catch (error) {
      console.error("Failed to load team:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="management-page">
        <div className="empty-state">
          <h3>Loading team...</h3>
        </div>
      </div>
    );
  }

  const equipments = team?.equipments || [];
  const students = team?.students || [];

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Trophy size={24} color="#05c7ee" />
            My Team & Squad
          </h1>
          <p>
            View your assigned squad profile, student athletes, and allocated sports equipment.
          </p>
        </div>
      </div>

      {!team ? (
        <div className="management-card">
          <div className="empty-state">
            <h3>No Team Assigned</h3>
            <p>
              You have not been assigned to a team yet.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Team Information Card */}
          <div className="management-card" style={{ marginBottom: "20px" }}>
            <div className="management-card-header">
              <h2>Team Overview</h2>
              <span className="status-badge success">
                {team.status || "Active"}
              </span>
            </div>

            <div className="management-card-body">
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <tbody>
                    <tr>
                      <th style={{ width: "200px" }}>TEAM NAME</th>
                      <td>
                        <strong style={{ color: "#f0f6fc", fontSize: "15px" }}>{team.name}</strong>
                      </td>
                    </tr>
                    <tr>
                      <th>TEAM ID</th>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            backgroundColor: "rgba(56, 189, 248, 0.1)",
                            border: "1px solid rgba(56, 189, 248, 0.25)",
                            borderRadius: "4px",
                            color: "#38bdf8",
                            fontFamily: "monospace",
                            fontWeight: "700",
                            fontSize: "12px"
                          }}
                        >
                          {team.teamId || "-"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>SPORT DISCIPLINE</th>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            backgroundColor: "rgba(234, 179, 8, 0.15)",
                            border: "1px solid rgba(234, 179, 8, 0.3)",
                            borderRadius: "4px",
                            color: "#facc15",
                            fontWeight: "600",
                            fontSize: "12px"
                          }}
                        >
                          {team.sport || "-"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>TOTAL SQUAD ATHLETES</th>
                      <td>
                        <span style={{ color: "#4ade80", fontWeight: "700" }}>
                          {students.length} Athletes
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>ALLOCATED GEAR ITEMS</th>
                      <td>
                        <span style={{ color: "#05c7ee", fontWeight: "700" }}>
                          {equipments.reduce((acc, eq) => acc + (eq.quantity || 0), 0)} Total Units ({equipments.length} Items)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Allocated Sports Equipment & Quantities */}
          <div className="management-card" style={{ marginBottom: "20px" }}>
            <div className="management-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="#05c7ee" />
                Allocated Sports Equipments & Quantities
              </h2>
              <span style={{ fontSize: "12px", color: "#8da3b5" }}>
                {equipments.length} Gear Types Allocated
              </span>
            </div>

            <div className="management-card-body">
              {equipments.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 20px", textAlign: "center" }}>
                  <Package size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
                  <h3 style={{ fontSize: "15px" }}>No Equipment Allocated Yet</h3>
                  <p style={{ color: "#8da3b5", fontSize: "13px" }}>
                    Sports equipment allocated to your squad by administration will appear here with assigned quantities.
                  </p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>EQUIPMENT ITEM</th>
                        <th>EQUIPMENT ID</th>
                        <th>CATEGORY</th>
                        <th>ALLOCATED QUANTITY</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipments.map((eq, idx) => {
                        const eqDetails = eq.equipmentId || {};
                        return (
                          <tr key={eq._id || eqDetails._id || idx}>
                            <td>
                              <strong style={{ color: "#f0f6fc" }}>
                                {eq.name || eqDetails.name || "Sports Equipment"}
                              </strong>
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: "2px 6px",
                                  backgroundColor: "rgba(56, 189, 248, 0.1)",
                                  border: "1px solid rgba(56, 189, 248, 0.25)",
                                  borderRadius: "4px",
                                  color: "#38bdf8",
                                  fontFamily: "monospace",
                                  fontSize: "12px"
                                }}
                              >
                                {eqDetails.equipmentId || "-"}
                              </span>
                            </td>
                            <td>{eqDetails.category || "General Gear"}</td>
                            <td>
                              <span
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: "10px",
                                  backgroundColor: "rgba(5, 199, 238, 0.15)",
                                  color: "#05c7ee",
                                  fontWeight: "700",
                                  fontSize: "13px"
                                }}
                              >
                                {eq.quantity || 0} Units
                              </span>
                            </td>
                            <td>
                              <span className="status-badge success">
                                Assigned to Squad
                              </span>
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

          {/* Team Members */}
          <div className="management-card">
            <div className="management-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} color="#05c7ee" />
                Team Athletes ({students.length})
              </h2>
            </div>

            <div className="management-card-body">
              {students.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>NAME</th>
                        <th>STUDENT ID</th>
                        <th>REGISTER NUMBER</th>
                        <th>EMAIL</th>
                        <th>DEPARTMENT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id}>
                          <td>
                            <strong style={{ color: "#f0f6fc" }}>{student.name}</strong>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: "2px 6px",
                                backgroundColor: "rgba(56, 189, 248, 0.1)",
                                borderRadius: "4px",
                                color: "#38bdf8",
                                fontFamily: "monospace",
                                fontSize: "12px"
                              }}
                            >
                              {student.studentId}
                            </span>
                          </td>
                          <td>{student.registerNumber || "-"}</td>
                          <td>{student.email}</td>
                          <td>{student.department || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: "30px 20px", textAlign: "center" }}>
                  <Users size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
                  <h3 style={{ fontSize: "15px" }}>No Team Members</h3>
                  <p style={{ color: "#8da3b5", fontSize: "13px" }}>
                    No students are currently assigned to this team.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Team;