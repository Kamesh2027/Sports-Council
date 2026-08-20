const Venues = () => {

    return (
        <div className="management-page">

            <div className="page-header">

                <div>
                    <h1>Venues</h1>

                    <p>
                        Manage sports grounds, courts and other facilities.
                    </p>

                </div>

                <button className="primary-btn">
                    + Add Venue
                </button>

            </div>

            <div className="management-card">

                <div className="card-title">
                    <h2>Venue Management</h2>
                </div>

                <div className="empty-state">

                    <h3>No venues found</h3>

                    <p>
                        Sports venues added to the system will appear here.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Venues;