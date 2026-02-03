import { useEffect, useState } from "react";
import { getExam, startExam, endExam, resetEvent } from "../api/exam.api";
import { verifyAdminKey } from "../api/admin.api";

const Admin = () => {
  const [exam, setExam] = useState(null);
  const [key, setKey] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("adminKey");
    if (savedKey) verify(savedKey);
  }, []);

  const verify = async (k) => {
    try {
      setError("");
      localStorage.setItem("adminKey", k);
      await verifyAdminKey();
      setAuthorized(true);

      if (window.location.pathname !== "/admin/dashboard") {
        window.location.href = "/admin/dashboard";
      } else {
        fetchExam();
      }
    } catch {
      localStorage.removeItem("adminKey");
      setAuthorized(false);
      setError("Invalid Admin Access Key");
    }
  };

  const fetchExam = async () => {
    const res = await getExam();
    setExam(res.data.exam);
  };

  /* ===================== AUTH SCREEN ===================== */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-500 px-6">
        <div className="bg-[#111] border border-orange-500/20 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl">
          <h1 className="text-3xl font-black italic text-center mb-2 tracking-tighter">
            ADMIN CONTROL
          </h1>
          <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-10">
            Secure Access Required
          </p>

          <input
            type="password"
            placeholder="Enter Admin Key"
            className="w-full p-5 rounded-2xl bg-black border border-white/10 text-white mb-6 focus:border-orange-500 outline-none"
            onChange={(e) => setKey(e.target.value)}
          />

          <button
            onClick={() => verify(key)}
            className="w-full bg-orange-500 text-black py-5 rounded-2xl font-black tracking-widest hover:bg-orange-400 transition-all"
          >
            AUTHORIZE
          </button>

          {error && (
            <p className="text-red-500 text-xs text-center mt-6 uppercase tracking-widest animate-pulse">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-500">
        Initializing Control Center...
      </div>
    );
  }

  /* ===================== DASHBOARD ===================== */
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-14">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-orange-500">
              CONTROL CENTER
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">
              Bug Hunt Event Management
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("adminKey");
              window.location.href = "/admin";
            }}
            className="text-red-500 text-xs font-black uppercase tracking-widest hover:underline"
          >
            Logout
          </button>
        </div>

        {/* PANELS */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* EVENT STATUS */}
          <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-xs text-orange-500 font-black uppercase tracking-widest mb-4">
              Event Status
            </h2>

            <div className="flex items-center gap-4 mb-10">
              <span
                className={`w-4 h-4 rounded-full ${
                  exam.status === "live"
                    ? "bg-green-500 animate-pulse"
                    : "bg-orange-500"
                }`}
              ></span>
              <span className="text-4xl font-black uppercase">
                {exam.status}
              </span>
            </div>

            <div className="space-y-4">
              <button
                onClick={async () => {
                  await startExam();
                  fetchExam();
                }}
                disabled={exam.status === "live"}
                className="w-full py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-black tracking-widest transition disabled:opacity-40"
              >
                ▶ OPEN EXAM
              </button>

              <button
                onClick={async () => {
                  if (window.confirm("End exam for everyone?")) {
                    await endExam();
                    fetchExam();
                  }
                }}
                className="w-full py-5 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl font-black tracking-widest transition"
              >
                ⏹ END EVENT
              </button>
            </div>
          </div>

          {/* SYSTEM ACTIONS */}
          <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-xs text-orange-500 font-black uppercase tracking-widest mb-4">
                Critical Actions
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Reset will permanently delete all submissions and
                return system to waiting state.
              </p>
            </div>

            <button
              onClick={async () => {
                if (window.confirm("⚠️ DELETE ALL DATA?")) {
                  await resetEvent();
                  fetchExam();
                }
              }}
              className="mt-10 w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black tracking-widest transition"
            >
              🔄 FULL SYSTEM RESET
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;
