import { useEffect, useState } from "react";
import axios from "axios";

const Equipment = () => {

    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/coach/equipment",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setEquipment(response.data.equipment || []);

        } catch (error) {

            console.error("Failed to load equipment:", error);

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="management-page">

            <div className="page-header">

                <div>

                    <h1>Equipment</h1>

                    <p>
                        View equipment available for your team.
                    </p>

                </div>

            </div>


            <div className="management-card">

                <div className="management-card-header">

                    <h2>
                        Equipment Inventory
                    </h2>

                    <span>
                        {equipment.length} Items
                    </span>

                </div>


                <div className="management-card-body">

                    {loading ? (

                        <div className="empty-state">
                            <h3>Loading equipment...</h3>
                        </div>

                    ) : equipment.length === 0 ? (

                        <div className="empty-state">

                            <h3>No Equipment Found</h3>

                            <p>
                                No equipment is currently assigned
                                to your team.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-table-wrapper">

                            <table className="admin-table">

                                <thead>

                                    <tr>
                                        <th>EQUIPMENT</th>
                                        <th>CATEGORY</th>
                                        <th>QUANTITY</th>
                                        <th>AVAILABLE</th>
                                        <th>STATUS</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {equipment.map((item) => (

                                        <tr key={item._id}>

                                            <td>
                                                {item.name}
                                            </td>

                                            <td>
                                                {item.category || "-"}
                                            </td>

                                            <td>
                                                {item.quantity || 0}
                                            </td>

                                            <td>
                                                {item.availableQuantity ??
                                                    item.quantity ??
                                                    0}
                                            </td>

                                            <td>

                                                <span className="status-badge success">
                                                    {item.status ||
                                                        "Available"}
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

export default Equipment;