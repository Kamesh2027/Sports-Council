const Equipment = () => {

    return (
        <div className="management-page">

            <div className="page-header">

                <div>
                    <h1>Equipment</h1>

                    <p>
                        Manage sports equipment inventory and availability.
                    </p>

                </div>

                <button className="primary-btn">
                    + Add Equipment
                </button>

            </div>

            <div className="management-card">

                <div className="card-title">
                    <h2>Equipment Inventory</h2>
                </div>

                <div className="empty-state">

                    <h3>No equipment found</h3>

                    <p>
                        Sports equipment added to the inventory will appear here.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Equipment;