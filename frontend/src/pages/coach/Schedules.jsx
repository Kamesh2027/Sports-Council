import { useEffect, useState } from "react";
import axios from "axios";

const Schedules = () => {

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/coach/schedules",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSchedules(response.data.schedules || []);

    } catch (error) {

      console.error(
        "Failed to load schedules:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="management-page">

      <div className="page-header">

        <div>

          <h1>Schedules</h1>

          <p>
            View upcoming matches and scheduled fixtures.
          </p>

        </div>

      </div>


      <div className="management-card">

        <div className="management-card-header">

          <h2>
            Match Schedule
          </h2>

          <span>
            {schedules.length} Fixtures
          </span>

        </div>


        <div className="management-card-body">

          {loading ? (

            <div className="empty-state">
              <h3>Loading schedules...</h3>
            </div>

          ) : schedules.length === 0 ? (

            <div className="empty-state">

              <h3>No Schedules Found</h3>

              <p>
                No matches have been scheduled for
                your team.
              </p>

            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>
                    <th>DATE</th>
                    <th>TIME</th>
                    <th>TEAM</th>
                    <th>OPPONENT</th>
                    <th>VENUE</th>
                    <th>STATUS</th>
                  </tr>

                </thead>

                <tbody>

                  {schedules.map((schedule) => (

                    <tr key={schedule._id}>

                      <td>
                        {schedule.date
                          ? new Date(
                            schedule.date
                          ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {schedule.time || "-"}
                      </td>

                      <td>
                        {schedule.team?.name ||
                          schedule.teamName ||
                          "-"}
                      </td>

                      <td>
                        {schedule.opponent ||
                          schedule.opponentTeam ||
                          "-"}
                      </td>

                      <td>
                        {schedule.venue?.name ||
                          schedule.venueName ||
                          "-"}
                      </td>

                      <td>

                        <span className="status-badge processing">
                          {schedule.status ||
                            "Scheduled"}
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

export default Schedules;