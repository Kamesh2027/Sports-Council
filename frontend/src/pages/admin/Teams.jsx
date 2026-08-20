const Teams = () => {

    return (
        <div className="management-page">

            <div className="page-header">

                <div>
                    <h1>Teams</h1>

                    <p>
                        Manage sports teams, coaches and players.
                    </p>
                </div>

                <button className="primary-btn">
                    + Create Team
                </button>

            </div>

            <div className="management-card">

                <div className="card-title">
                    <h2>Team Management</h2>
                </div>

                <div className="empty-state">

                    <h3>No teams found</h3>

                    <p>
                        Teams created by the Sports Council will appear here.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Teams;