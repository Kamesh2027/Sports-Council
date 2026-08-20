const Tournaments = () => {

    return (
        <div className="management-page">

            <div className="page-header">

                <div>
                    <h1>Tournaments</h1>

                    <p>
                        Create and manage sports tournaments and competitions.
                    </p>

                </div>

                <button className="primary-btn">
                    + Create Tournament
                </button>

            </div>

            <div className="management-card">

                <div className="card-title">
                    <h2>Tournament Management</h2>
                </div>

                <div className="empty-state">

                    <h3>No tournaments found</h3>

                    <p>
                        Tournaments created by the Sports Council will appear here.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Tournaments;