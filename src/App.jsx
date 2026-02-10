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
  const isFinished = localStorage.getItem("examFinished") === "true";

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES WITH GUARDS */}
        <Route 
          path="/" 
          element={isFinished ? <Navigate to="/exit" replace /> : <Register />} 
        />
        
        <Route 
          path="/exam" 
          element={isFinished ? <Navigate to="/exit" replace /> : <Exam />} 
        />
        
        <Route path="/exit" element={<Exit />} />
        
        {/* Rest of the routes... */}
        <Route path="/admin" element={<Admin />} />
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Admin />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/leaderboard" element={<Leaderboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;