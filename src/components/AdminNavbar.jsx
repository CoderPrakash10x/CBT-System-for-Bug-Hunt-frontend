import { Link, useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminKey");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-500 text-[10px] font-black italic tracking-widest">
            CONTROL MODE
          </span>
          <h1 className="text-white font-black tracking-tighter text-lg">
            ADMIN DASHBOARD
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">
          <Link
            to="/admin/leaderboard"
            className="text-gray-400 hover:text-orange-500 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Live Leaderboard
          </Link>
          <Link
            to="/admin/reports"
            className="text-gray-400 hover:text-orange-500 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Live reports
          </Link>

          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest
              text-red-500 bg-red-500/10 border border-red-500/30
              hover:bg-red-600 hover:text-white transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
