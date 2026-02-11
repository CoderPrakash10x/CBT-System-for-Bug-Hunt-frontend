import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Register from "./pages/Register";
import Exam from "./pages/Exam";
import Admin from "./pages/Admin";
import Leaderboard from "./pages/Leaderboard";
import Exit from "./pages/Exit";
import AdminRoute from "./components/AdminRoute";
import AdminReports from "./pages/admin/AdminReports";
import AdminNavbar from "./components/AdminNavbar";

const App = () => {
  const [session, setSession] = useState({
    userId: localStorage.getItem("userId"),
    examFinished: localStorage.getItem("examFinished") === "true",
    examStarted: localStorage.getItem("examStarted") === "true"
  });

  // Sync state with localStorage
  const syncSession = useCallback(() => {
    setSession({
      userId: localStorage.getItem("userId"),
      examFinished: localStorage.getItem("examFinished") === "true",
      examStarted: localStorage.getItem("examStarted") === "true"
    });
  }, []);

  useEffect(() => {
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, [syncSession]);

  const isUserBlocked = !!(session.userId && session.examFinished);
  const shouldBeInExam = !!(session.userId && session.examStarted && !session.examFinished);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            isUserBlocked ? <Navigate to="/exit" replace /> : 
            shouldBeInExam ? <Navigate to="/exam" replace /> : 
            <Register updateSession={syncSession} />
          } 
        />
        
        <Route 
          path="/exam" 
          element={
            isUserBlocked ? <Navigate to="/exit" replace /> : 
            (session.userId && session.examStarted) ? <Exam /> : 
            <Navigate to="/" replace />
          } 
        />

        <Route path="/exit" element={<Exit />} />
        <Route path="/admin" element={<Admin />} />
        
        <Route element={<AdminRoute />}>
          <Route element={<AdminNavbar />}> 
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