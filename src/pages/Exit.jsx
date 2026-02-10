import { useEffect } from "react";

const Exit = () => {
  useEffect(() => {
    // 🛡️ LOCK BROWSER HISTORY: Back button won't work
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    // Mark exam as finished so App.jsx can block re-entry
    localStorage.setItem("examFinished", "true");
    localStorage.removeItem("examStarted");
  }, []);

  const handleFullExit = () => {
    localStorage.clear(); 
    window.location.href = "https://evolvera-frontend-u8aw.vercel.app"; 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] animate-pulse" />

      <div className="relative z-10 bg-[#0f0f11]/80 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-16 max-w-lg w-full text-center shadow-[0_20px_100px_rgba(0,0,0,0.8)]">
        <div className="relative w-32 h-32 mx-auto mb-10">
            <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        </div>

        <div className="space-y-2 mb-10">
            <h1 className="text-5xl font-black italic tracking-tighter text-white">
                MISSION <span className="text-orange-500">COMPLETE</span>
            </h1>
            <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-12 px-4">
            Congratulations! Your session has been successfully logged.
            <span className="block mt-2 text-orange-500/60 text-xs font-bold uppercase tracking-[0.2em]">Access Tokens Revoked</span>
        </p>

        <div className="space-y-4">
          <button
            onClick={handleFullExit}
            className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-black rounded-2xl font-black text-lg tracking-widest transition-all shadow-[0_10px_40px_rgba(249,115,22,0.2)] active:scale-95"
          >
            EXIT PORTAL
          </button>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Safe to close this tab now</p>
        </div>
      </div>
    </div>
  );
};

export default Exit;