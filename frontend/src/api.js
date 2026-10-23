
import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: `${API_URL}/api`,
});

// Legg automatisk JWT-token på alle API-kall.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const register = async (email, password) => {
    const response = await api.post("/auth/register", {
        email,
        password,
    });

    return response.data;
};

export const login = async (email, password) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });

    localStorage.setItem("token", response.data.token);

    return response.data;
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const getTasks = async () => {
    const response = await api.get("/tasks");
    return response.data;
};

export const createTask = async (task) => {
    const response = await api.post("/tasks", task);
    return response.data;
};

export const updateTask = async (id, task) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
};

export const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
};

export const getProjects = async () => {
    const response = await api.get("/projects");
    return response.data;
};

export const createProject = async (project) => {
    const response = await api.post("/projects", project);
    return response.data;
};
