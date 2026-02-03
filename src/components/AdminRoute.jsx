import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const adminKey = localStorage.getItem("adminKey");
  
  // Agar key hai toh andar jaane do, varna admin login page par
  return adminKey ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default AdminRoute;