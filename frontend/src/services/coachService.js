import axios from "axios";
import { API_BASE } from "./api";

const API_URL = `${API_BASE}/coach`;

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