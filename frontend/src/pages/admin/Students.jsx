const Students = () => {

    return (
        <div className="management-page">

            <div className="page-header">

                <div>
                    <h1>Students</h1>

                    <p>
                        Manage registered students and their team assignments.
                    </p>
                </div>

            </div>

            <div className="management-card">

                <div className="card-title">
                    <h2>Student Management</h2>
                </div>

                <div className="empty-state">

                    <h3>No students registered</h3>

                    <p>
                        Registered students will appear here.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Students;