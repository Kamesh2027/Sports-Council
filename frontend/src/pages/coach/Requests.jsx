import { useEffect, useState } from "react";
import axios from "axios";

const Requests = () => {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/coach/requests",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setRequests(response.data.requests || []);

        } catch (error) {

            console.error("Failed to load requests:", error);

        } finally {

            setLoading(false);

        }
    };


    const getStatusClass = (status) => {

        if (status === "approved") {
            return "success";
        }

        if (status === "pending") {
            return "warning";
        }

        if (status === "rejected") {
            return "danger";
        }

        return "processing";
    };


    return (
        <div className="management-page">

            <div className="page-header">

                <div>

                    <h1>Equipment Requests</h1>

                    <p>
                        Track your equipment requests and their status.
                    </p>

                </div>

            </div>


            <div className="management-card">

                <div className="management-card-header">

                    <h2>
                        My Requests
                    </h2>

                    <span>
                        {requests.length} Requests
                    </span>

                </div>


                <div className="management-card-body">

                    {loading ? (

                        <div className="empty-state">
                            <h3>Loading requests...</h3>
                        </div>

                    ) : requests.length === 0 ? (

                        <div className="empty-state">

                            <h3>No Requests Found</h3>

                            <p>
                                You have not submitted any equipment
                                requests.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-table-wrapper">

                            <table className="admin-table">

                                <thead>

                                    <tr>
                                        <th>EQUIPMENT</th>
                                        <th>QUANTITY</th>
                                        <th>REQUEST DATE</th>
                                        <th>DUE DATE</th>
                                        <th>STATUS</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {requests.map((request) => (

                                        <tr key={request._id}>

                                            <td>
                                                {request.equipmentName ||
                                                    request.equipment?.name ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {request.quantity || 0}
                                            </td>

                                            <td>
                                                {request.createdAt
                                                    ? new Date(
                                                        request.createdAt
                                                    ).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td>
                                                {request.dueDate
                                                    ? new Date(
                                                        request.dueDate
                                                    ).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td>

                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        request.status
                                                    )}`}
                                                >
                                                    {request.status ||
                                                        "Pending"}
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

export default Requests;