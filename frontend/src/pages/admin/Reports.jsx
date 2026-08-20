const Reports = () => {

    return (
        <div className="management-page">

            <div className="page-header">

                <div>
                    <h1>Reports</h1>

                    <p>
                        View sports council inventory, participation and
                        tournament reports.
                    </p>

                </div>

            </div>

            <div className="report-grid">

                <div className="report-card">

                    <h3>Equipment Report</h3>

                    <p>
                        Equipment inventory, availability and maintenance.
                    </p>

                    <button>
                        View Report
                    </button>

                </div>

                <div className="report-card">

                    <h3>Student Report</h3>

                    <p>
                        Student registrations and team participation.
                    </p>

                    <button>
                        View Report
                    </button>

                </div>

                <div className="report-card">

                    <h3>Tournament Report</h3>

                    <p>
                        Tournament and fixture information.
                    </p>

                    <button>
                        View Report
                    </button>

                </div>

                <div className="report-card">

                    <h3>Venue Report</h3>

                    <p>
                        Venue usage and availability information.
                    </p>

                    <button>
                        View Report
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Reports;