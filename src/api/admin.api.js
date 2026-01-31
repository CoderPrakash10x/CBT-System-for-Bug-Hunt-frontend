import api from "./axios";

export const verifyAdminKey = () => api.post("/admin/verify");