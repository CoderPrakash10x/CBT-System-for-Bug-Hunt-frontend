import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { verifyAdminKey } from "../api/admin.api";

const AdminRoute = () => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const key = localStorage.getItem("adminKey");

    if (!key) {
      setIsValid(false);
      return;
    }

    verifyAdminKey()
      .then(() => setIsValid(true))
      .catch(() => {
        localStorage.removeItem("adminKey");
        setIsValid(false);
      });
  }, []);

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-orange-500 font-black text-[10px] tracking-[0.3em] uppercase animate-pulse">
          Authenticating Admin...
        </p>
      </div>
    );
  }

  return isValid ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default AdminRoute;
