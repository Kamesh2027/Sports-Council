import api from "./api";

const getDashboard = async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
};

const getCoaches = async () => {
    const response = await api.get("/admin/coaches");
    return response.data;
};

const addCoach = async (coachData) => {
    const response = await api.post("/admin/coaches", coachData);
    return response.data;
};

const deleteCoach = async (id) => {
    const response = await api.delete(`/admin/coaches/${id}`);
    return response.data;
};

const getStudents = async () => {
    const response = await api.get("/admin/students");
    return response.data;
};

const updateStudentApproval = async (id, status) => {
    const response = await api.put(`/admin/students/${id}/status`, { status });
    return response.data;
};

const getActivities = async () => {
    const response = await api.get("/admin/activities");
    return response.data;
};

export default {
    getDashboard,
    getActivities,
    getCoaches,
    addCoach,
    deleteCoach,
    getStudents,
    updateStudentApproval
};