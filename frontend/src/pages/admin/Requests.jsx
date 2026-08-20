const Requests = () => {

    return (
        <div className="management-page">

            <div className="page-header">

                <div>
                    <h1>Equipment Requests</h1>

                    <p>
                        Review and manage equipment issue and return requests.
                    </p>

                </div>

            </div>

            <div className="management-card">

                <div className="card-title">
                    <h2>Pending Requests</h2>
                </div>

                <div className="empty-state">

                    <h3>No pending requests</h3>

                    <p>
                        Equipment requests submitted by students or coaches
                        will appear here.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Requests;