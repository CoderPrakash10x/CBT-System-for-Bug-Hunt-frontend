import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Exam from "./pages/Exam";
import Admin from "./pages/Admin";
import Leaderboard from "./pages/Leaderboard";
import Exit from "./pages/Exit";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/exit" element={<Exit />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
