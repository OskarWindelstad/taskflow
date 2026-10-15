
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

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
