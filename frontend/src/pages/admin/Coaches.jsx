import { useState } from "react";
import Modal from "../../components/common/Modal";
import CoachForm from "../../components/common/CoachForm";
const Coaches = () => {
    const [showModal, setShowModal] = useState(false);
    return (
        <div className="management-page">

            <div className="page-header">
                
                <div>
                    <h1>Coaches</h1>

                    <p>
                        Manage registered sports coaches.
                    </p>
                </div>

                <button className="primary-btn">
                    + ADD COACH
                </button>

            </div>


            <div className="management-card">

                <div className="card-title">
                    <h2>Coach Management</h2>
                </div>

                <div className="empty-state">

                    <h3>
                        No coaches registered
                    </h3>

                    <p>
                        Registered coaches will appear here.
                    </p>

                </div>

            </div>
            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                <CoachForm onSuccess={() => setShowModal(false)} />
                </Modal>
            )}
        </div>
    );
};

export default Coaches;