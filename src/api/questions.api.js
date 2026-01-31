import api from "./axios";

export const getQuestions = () =>
  api.get("/questions");
