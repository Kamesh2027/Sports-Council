import axios from "axios";

const API_HOST = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
const API_URL = `http://${API_HOST}:5000/api/coach`;

export const coachService = {

    // =====================================================
    // COACH DASHBOARD
    // =====================================================

    getDashboard: () => {

        const token = localStorage.getItem("token");

        return axios.get(
            `${API_URL}/dashboard`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    },


    // =====================================================
    // COACH STUDENTS
    // =====================================================

    getStudents: () => {

        const token = localStorage.getItem("token");

        return axios.get(
            `${API_URL}/students`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    },


    // =====================================================
    // COACH TEAM
    // =====================================================

    getTeam: () => {

        const token = localStorage.getItem("token");

        return axios.get(
            `${API_URL}/team`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    }

};