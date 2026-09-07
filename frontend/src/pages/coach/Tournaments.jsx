import { useEffect, useState } from "react";
import axios from "axios";

const Tournaments = () => {

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/coach/tournaments",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTournaments(response.data.tournaments || []);

    } catch (error) {

      console.error(
        "Failed to load tournaments:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  const getStatusClass = (status) => {

    const value = status?.toLowerCase();

    if (value === "ongoing" || value === "in-progress") {
      return "processing";
    }

    if (value === "upcoming") {
      return "warning";
    }

    if (value === "completed") {
      return "success";
    }

    return "processing";
  };


  return (
    <div className="management-page">

      <div className="page-header">

        <div>

          <h1>Tournaments</h1>

          <p>
            View upcoming and ongoing sports tournaments.
          </p>

        </div>

      </div>


      <div className="management-card">

        <div className="management-card-header">

          <h2>
            Tournaments
          </h2>

          <span>
            {tournaments.length} Tournaments
          </span>

        </div>


        <div className="management-card-body">

          {loading ? (

            <div className="empty-state">
              <h3>Loading tournaments...</h3>
            </div>

          ) : tournaments.length === 0 ? (

            <div className="empty-state">

              <h3>No Tournaments Found</h3>

              <p>
                There are currently no tournaments
                available.
              </p>

            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>
                    <th>TOURNAMENT</th>
                    <th>SPORT</th>
                    <th>START DATE</th>
                    <th>END DATE</th>
                    <th>STATUS</th>
                  </tr>

                </thead>

                <tbody>

                  {tournaments.map((tournament) => (

                    <tr key={tournament._id}>

                      <td>
                        {tournament.name}
                      </td>

                      <td>
                        {tournament.sport || "-"}
                      </td>

                      <td>
                        {tournament.startDate
                          ? new Date(
                            tournament.startDate
                          ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {tournament.endDate
                          ? new Date(
                            tournament.endDate
                          ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>

                        <span
                          className={`status-badge ${getStatusClass(
                            tournament.status
                          )}`}
                        >
                          {tournament.status ||
                            "Upcoming"}
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

export default Tournaments;