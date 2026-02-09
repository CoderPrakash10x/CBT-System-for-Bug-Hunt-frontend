const Exit = () => {
  const flow = localStorage.getItem("examFlow");

  if (flow !== "ended") {
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      
      {/* 🔥 Glow Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 bg-[#111] border border-orange-500/20 rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl">
        
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <span className="text-4xl">🏁</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black italic tracking-tighter text-orange-500 mb-3">
          EXAM COMPLETED
        </h1>

        <p className="text-gray-400 text-sm uppercase tracking-widest mb-10">
          Your responses have been locked
        </p>

        {/* Actions */}
        <div className="grid gap-4">
          <a
            href="/"
            className="block w-full py-5 bg-white/5 text-gray-400 rounded-2xl font-bold tracking-widest hover:bg-white/10 transition-all"
          >
            EXIT PORTAL
          </a>
        </div>

        {/* Footer */}
        <p className="mt-10 text-[10px] uppercase tracking-[0.4em] text-orange-500/40 font-black">
          Designed & Built by prakash 
        </p>
      </div>
    </div>
  );
};

export default Exit;
