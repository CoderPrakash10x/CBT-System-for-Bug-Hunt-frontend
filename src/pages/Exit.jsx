import { useEffect, useState } from "react";

const Exit = () => {
  const [isDisqualified, setIsDisqualified] = useState(false);

  useEffect(() => {
    // Check if user came here due to violation
    // Exam.jsx me disqualification ke waqt hum ye flag set kar sakte hain
    const disqualified = localStorage.getItem("disqualified") === "true";
    setIsDisqualified(disqualified);

    // 🛡️ LOCK BROWSER HISTORY
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    localStorage.setItem("examFinished", "true");
    localStorage.removeItem("examStarted");
  }, []);

  const handleFullExit = () => {
    localStorage.clear(); 
    window.location.href = "https://evolvera-frontend-u8aw.vercel.app"; 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden">
      {/* Dynamic Background Colors */}
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${isDisqualified ? 'bg-red-600/10' : 'bg-orange-600/10'} rounded-full blur-[150px] animate-pulse`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] ${isDisqualified ? 'bg-red-500/10' : 'bg-orange-500/10'} rounded-full blur-[150px] animate-pulse`} />

      <div className="relative z-10 bg-[#0f0f11]/80 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-16 max-w-lg w-full text-center shadow-[0_20px_100px_rgba(0,0,0,0.8)]">
        
        {/* Icon Container */}
        <div className="relative w-32 h-32 mx-auto mb-10">
            <div className={`absolute inset-0 ${isDisqualified ? 'bg-red-500' : 'bg-orange-500'} rounded-full animate-ping opacity-20`}></div>
            <div className={`relative w-full h-full rounded-full bg-gradient-to-tr ${isDisqualified ? 'from-red-600 to-red-400' : 'from-orange-600 to-orange-400'} flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.4)]`}>
                {isDisqualified ? (
                  // X Icon for Disqualified
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // Check Icon for Success
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
            </div>
        </div>

        {/* Title Section */}
        <div className="space-y-2 mb-10">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">
                {isDisqualified ? (
                  <>SYSTEM <span className="text-red-500">BREACH</span></>
                ) : (
                  <>MISSION <span className="text-orange-500">COMPLETE</span></>
                )}
            </h1>
            <div className={`h-1 w-20 ${isDisqualified ? 'bg-red-500' : 'bg-orange-500'} mx-auto rounded-full`}></div>
        </div>

        {/* Message Section */}
        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-12 px-4">
            {isDisqualified 
              ? "Security violation detected. Your session has been terminated and logged for administrative review." 
              : "Congratulations! Your session has been successfully logged."
            }
            <span className={`block mt-2 ${isDisqualified ? 'text-red-500/60' : 'text-orange-500/60'} text-xs font-bold uppercase tracking-[0.2em]`}>
              Access Tokens Revoked
            </span>
        </p>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={handleFullExit}
            className={`w-full py-5 ${isDisqualified ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'} text-black rounded-2xl font-black text-lg tracking-widest transition-all active:scale-95`}
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