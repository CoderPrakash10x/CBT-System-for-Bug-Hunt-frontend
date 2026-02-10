import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { verifyAdminKey } from "../api/admin.api";

const AdminRoute = () => {
  const adminKey = localStorage.getItem("adminKey");
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!adminKey) {
        setIsValid(false);
        return;
      }
      try {
        // Backend se pucho ki key sach mein sahi hai ya bas fake hai
        await verifyAdminKey();
        setIsValid(true);
      } catch (err) {
        console.error("Auth Failed");
        localStorage.removeItem("adminKey"); // Fake key ko uda do
        setIsValid(false);
      }
    };
    checkAuth();
  }, [adminKey]);

  // Jab tak check ho raha hai, blank screen ya spinner dikhao
  if (isValid === null) return <div className="min-h-screen bg-black" />;

  return isValid ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default AdminRoute;