import api from "./axios";

// USER ENDPOINTS
export const getExam = () => api.get("/exam");

export const joinExam = (userId) => api.post("/exam/join", { userId });

export const saveAnswer = (data) => api.post("/exam/answer", data);

export const submitExam = (data) => api.post("/exam/submit", data);

// ADMIN ENDPOINTS 
// (Interceptors automatically add the key here)
export const startExam = () => api.post("/exam/start");

export const endExam = () => api.post("/exam/end");

export const resetEvent = () => api.post("/exam/reset");