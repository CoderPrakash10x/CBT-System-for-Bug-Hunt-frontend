import API from "./axios"; // Agar tumne axios file mein 'API' export kiya hai

// Yahan 'api.get' ki jagah 'API.get' hoga
export const getQuestions = (userId) => 
  API.get(`/questions?userId=${userId}`);