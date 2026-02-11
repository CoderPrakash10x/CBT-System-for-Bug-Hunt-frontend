import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Exit = () => {
  const [isDisqualified, setIsDisqualified] = useState(false);
  const navigate = useNavigate();

  /* ================= INIT ================= */
  useEffect(() => {
    const disqualified = localStorage.getItem("disqualified") === "true";
    setIsDisqualified(disqualified);

    // 🔒 Prevent back navigation
    window.history.pushState(null, "", window.location.href);
    const blockBack = () =>
      window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", blockBack);

    return () => window.removeEventListener("popstate", blockBack);
  }, []);

  /* ================= FINAL EXIT ================= */
  const handleFullExit = () => {
    // ✅ CLEAN SESSION (MOST IMPORTANT FIX)
    localStorage.removeItem("examFinished");
    localStorage.removeItem("examStarted");
    localStorage.removeItem("disqualified");
    localStorage.removeItem("userId");

    // 🔁 Fresh start
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div
        className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[160px] ${
          isDisqualified ? "bg-red-600/10" : "bg-orange-600/10"
        }`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[160px] ${
          isDisqualified ? "bg-red-500/10" : "bg-orange-500/10"
        }`}
      />

      <div className="relative z-10 bg-[#0f0f11]/80 backdrop-blur-xl border border-white/5 rounded-[3rem] p-14 max-w-lg w-full text-center shadow-[0_20px_100px_rgba(0,0,0,0.85)]">
        {/* ICON */}
        <div className="relative w-28 h-28 mx-auto mb-10">
          <div
            className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
              isDisqualified ? "bg-red-500" : "bg-orange-500"
            }`}
          />
          <div
            className={`relative w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr ${
              isDisqualified
                ? "from-red-600 to-red-400"
                : "from-orange-600 to-orange-400"
            }`}
          >
            {isDisqualified ? (
              <svg
                className="w-14 h-14 text-black"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-14 h-14 text-black"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* TEXT */}
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-3">
          {isDisqualified ? (
            <>SYSTEM <span className="text-red-500">BREACH</span></>
          ) : (
            <>MISSION <span className="text-orange-500">COMPLETE</span></>
          )}
        </h1>

        <div
          className={`h-1 w-20 mx-auto rounded-full mb-8 ${
            isDisqualified ? "bg-red-500" : "bg-orange-500"
          }`}
        />

        <p className="text-gray-400 text-sm leading-relaxed mb-12 px-4">
          {isDisqualified
            ? "Security violation detected. Your session has been terminated."
            : "Congratulations! Your session has been successfully logged."}
        </p>

        {/* EXIT */}
        <button
          onClick={handleFullExit}
          className={`w-full py-5 rounded-2xl font-black text-lg tracking-widest transition-all active:scale-95 ${
            isDisqualified
              ? "bg-red-600 hover:bg-red-700 text-black"
              : "bg-orange-500 hover:bg-orange-600 text-black"
          }`}
        >
          EXIT PORTAL
        </button>
      </div>
    </div>
  );
};

export default Exit;
