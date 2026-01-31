import api from "./axios";

export const getLeaderboard = () =>
  api.get("/leaderboard");
