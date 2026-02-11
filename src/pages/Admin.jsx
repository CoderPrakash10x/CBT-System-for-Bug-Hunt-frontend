import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExam, startExam, endExam, resetEvent } from "../api/exam.api";
import { verifyAdminKey } from "../api/admin.api";

/* ===================== CENTER UI ===================== */
const Center = ({ text, spinner }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black text-orange-500">
    {spinner && (
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
    )}
    <p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse text-center">
      {text}
    </p>
  </div>
);

const Admin = () => {
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [key, setKey] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= PERSISTED AUTH ================= */
  useEffect(() => {
    const savedKey = localStorage.getItem("adminKey");
    if (!savedKey) {
      setLoading(false);
      return;
    }

    verify(savedKey, true);
    // eslint-disable-next-line
  }, []);

  /* ================= VERIFY ADMIN ================= */
  const verify = async (k, isAuto = false) => {
    try {
      setError("");
      localStorage.setItem("adminKey", k);

      await verifyAdminKey();

      setAuthorized(true);
      setLoading(false);
      fetchExam();
    } catch {
      localStorage.removeItem("adminKey");
      setAuthorized(false);
      setLoading(false);
      if (!isAuto) setError("Invalid Admin Access Key");
    }
  };

  /* ================= FETCH EXAM ================= */
  const fetchExam = async () => {
    try {
      const res = await getExam();
      setExam(res.data.exam);
    } catch {
      console.error("Failed to fetch exam status");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return <Center text="Verifying Admin Credentials..." spinner />;
  }

  /* ================= AUTH SCREEN ================= */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6 text-orange-500">
        <div className="w-full max-w-md rounded-[2.5rem] p-10 bg-[#111] border border-orange-500/20 shadow-2xl">
          <h1 className="text-3xl font-black italic text-center mb-2 tracking-tighter">
            ADMIN CONTROL
          </h1>

          <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-10">
            Secure Access Required
          </p>

          <input
            type="password"
            placeholder="Enter Admin Key"
            className="w-full p-5 rounded-2xl bg-black border border-white/10 text-white mb-6 focus:border-orange-500 outline-none transition-all"
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verify(key)}
          />

          <button
            onClick={() => verify(key)}
            className="w-full py-5 rounded-2xl bg-orange-500 text-black font-black tracking-widest transition hover:bg-orange-400 active:scale-[0.97]"
          >
            AUTHORIZE
          </button>

          {error && (
            <p className="mt-6 text-center text-red-500 text-xs font-black uppercase tracking-widest animate-pulse">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!exam) return <Center text="Initializing Control Center..." spinner />;

  /* ================= DASHBOARD ================= */
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-14">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-orange-500">
              CONTROL CENTER
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">
              Bug Hunt Event Management
            </p>
          </div>

          {/* ✅ FIXED LOGOUT */}
          <button
            onClick={() => {
              localStorage.removeItem("adminKey");
              navigate("/admin", { replace: true });
            }}
            className="text-red-500 text-xs font-black uppercase tracking-widest hover:underline"
          >
            Logout
          </button>
        </div>

        {/* Panels */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Event Status */}
          <div className="rounded-[2.5rem] p-10 bg-[#111] border border-white/5 shadow-2xl">
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
              />
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
                className="w-full py-5 rounded-2xl bg-green-600 font-black tracking-widest transition hover:bg-green-500 disabled:opacity-40"
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
                className="w-full py-5 rounded-2xl bg-red-600/20 text-red-500 font-black tracking-widest transition hover:bg-red-600 hover:text-white"
              >
                ⏹ END EVENT
              </button>
            </div>
          </div>

          {/* Critical Actions */}
          <div className="rounded-[2.5rem] p-10 bg-[#111] border border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-xs text-orange-500 font-black uppercase tracking-widest mb-4">
                Critical Actions
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Reset will permanently delete all submissions and return the
                system to waiting state.
              </p>
            </div>

            <button
              onClick={async () => {
                if (window.confirm("⚠️ DELETE ALL DATA?")) {
                  await resetEvent();
                  fetchExam();
                }
              }}
              className="mt-10 w-full py-5 rounded-2xl bg-white/5 border border-white/10 font-black tracking-widest transition hover:bg-white/10"
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
