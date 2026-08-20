const Schedules = () => {

    return (
        <div className="management-page">

            <div className="page-header">

                <div>
                    <h1>Schedules</h1>

                    <p>
                        Manage tournament fixtures, venues and time slots.
                    </p>

                </div>

                <button className="primary-btn">
                    + Create Schedule
                </button>

            </div>

            <div className="management-card">

                <div className="card-title">
                    <h2>Fixture Schedule</h2>
                </div>

                <div className="empty-state">

                    <h3>No schedules found</h3>

                    <p>
                        Tournament fixtures will appear here once schedules
                        are created.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Schedules;