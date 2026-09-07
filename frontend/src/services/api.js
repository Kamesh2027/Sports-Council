import axios from "axios";

const getBaseUrl = () => {
    const hostname = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
    return `http://${hostname}:5000/api`;
};

const api = axios.create({
    baseURL: getBaseUrl()
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;