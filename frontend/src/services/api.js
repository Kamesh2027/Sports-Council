import axios from "axios";

export const getBaseUrl = () => {
    let envUrl = import.meta.env?.VITE_API_URL;
    if (envUrl) {
        envUrl = envUrl.trim().replace(/\/+$/, "");
        if (!envUrl.endsWith("/api")) {
            envUrl = `${envUrl}/api`;
        }
        return envUrl;
    }
    const hostname = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
    return `http://${hostname}:5000/api`;
};

export const API_BASE = getBaseUrl();

const api = axios.create({
    baseURL: API_BASE
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

export const apiRequest = async (path, options = {}) => {
    const cleanPath = path.startsWith("/api") ? path.replace(/^\/api/, "") : path;
    const url = `${API_BASE}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };
    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    } else {
        const token = localStorage.getItem("token");
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    return response;
};

export default api;