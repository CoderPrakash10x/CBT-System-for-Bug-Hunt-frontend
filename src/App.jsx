import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Register from "./pages/Register";
import Exam from "./pages/Exam";
import Admin from "./pages/Admin";
import Leaderboard from "./pages/Leaderboard";
import Exit from "./pages/Exit";
import AdminRoute from "./components/AdminRoute";
import AdminReports from "./pages/admin/AdminReports";
import AdminNavbar from "./components/AdminNavbar";

const AdminLayout = () => (
  <div className="min-h-screen bg-[#0a0a0c]">
    <AdminNavbar />
    <Outlet />
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Register />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/exit" element={<Exit />} />
        
        <Route path="/admin" element={<Admin />} />

        {/* ADMIN ONLY */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Admin />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/leaderboard" element={<Leaderboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
