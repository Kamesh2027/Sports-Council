import api from "./api";

export const getTournaments = async (params = {}) => {
    const response = await api.get("/admin/tournaments", { params });
    return response.data;
};

export const createTournament = async (tournamentData) => {
    const response = await api.post("/admin/tournaments", tournamentData);
    return response.data;
};

export const updateTournament = async (id, tournamentData) => {
    const response = await api.put(`/admin/tournaments/${id}`, tournamentData);
    return response.data;
};

export const deleteTournament = async (id) => {
    const response = await api.delete(`/admin/tournaments/${id}`);
    return response.data;
};

export default {
    getTournaments,
    createTournament,
    updateTournament,
    deleteTournament
};
