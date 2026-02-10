import API from "./axios";

// USER
export const getExam = () => API.get("/exam");
export const joinExam = (userId) => API.post("/exam/join", { userId });
export const submitExam = (data) => API.post("/exam/submit", data);

// ADMIN
export const startExam = () => API.post("/exam/start");
export const endExam = () => API.post("/exam/end");
export const resetEvent = () => API.post("/exam/reset");
