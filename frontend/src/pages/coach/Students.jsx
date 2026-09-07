import { useEffect, useState } from "react";
import axios from "axios";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [studentsRes, teamRes] = await Promise.allSettled([
        axios.get("http://localhost:5000/api/coach/students", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/coach/team", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (studentsRes.status === "fulfilled") {
        setStudents(studentsRes.value.data.students || []);
      }
      if (teamRes.status === "fulfilled") {
        setTeam(teamRes.value.data.team || null);
      }
    } catch (error) {
      console.error("Failed to load coach students:", error);
    } finally {
      setLoading(false);
    }
  };

  const teamName = team?.name || "Assigned Squad";

  return (
    <div className="management-page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1>Squad Athletes & Students</h1>
          <p>
            View student athletes registered and assigned to <strong>{teamName}</strong>.
          </p>
        </div>

        {team && (
          <div
            style={{
              padding: "6px 14px",
              backgroundColor: "rgba(5, 199, 238, 0.1)",
              border: "1px solid rgba(5, 199, 238, 0.3)",
              borderRadius: "20px",
              color: "#05c7ee",
              fontSize: "12px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>🏆</span>
            <span>Squad: {team.name}</span>
          </div>
        )}
      </div>

      <div className="management-card">
        <div className="management-card-header">
          <h2>
            Squad Roster ({students.length})
          </h2>
          <span style={{ fontSize: "12px", color: "#35d49b", fontWeight: 700 }}>
            {teamName}
          </span>
        </div>

        <div className="management-card-body">
          {loading ? (
            <div className="empty-state">
              <h3>Loading athletes...</h3>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>👥</div>
              <h3>No Athletes Assigned Yet</h3>
              <p>
                When students register and select your coach profile, they will appear in your <strong>{teamName}</strong> roster here.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ATHLETE NAME</th>
                    <th>STUDENT ID</th>
                    <th>ROLL / REG NO</th>
                    <th>EMAIL</th>
                    <th>DEPARTMENT</th>
                    <th>SQUAD</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <strong style={{ color: "#f0f6fc" }}>{student.name}</strong>
                      </td>
                      <td>
                        <span style={{ color: "#38bdf8", fontFamily: "monospace", fontWeight: 700 }}>
                          {student.studentId}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "#cbd3da" }}>
                          {student.registerNumber || "-"}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "#8da3b5", fontSize: "12px" }}>
                          {student.email}
                        </span>
                      </td>
                      <td>
                        {student.department || "General"}
                      </td>
                      <td>
                        <span style={{ color: "#35d49b", fontSize: "12px", fontWeight: 600 }}>
                          {teamName}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge success">
                          {student.approvalStatus === "approved" || !student.approvalStatus ? "Active" : student.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;