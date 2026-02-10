import API from "./axios";

// All submissions summary
export const getAllSubmissions = () =>
  API.get("/admin/submissions");

// Single user full report
export const getUserReport = (userId) =>
  API.get(`/admin/report/${userId}`);

// (future)
export const downloadUserReport = (userId) =>
  API.get(`/admin/report/${userId}/download`);
