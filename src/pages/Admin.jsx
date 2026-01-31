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
      fetchExam();
    } catch (err) {
      localStorage.removeItem("adminKey");
      setAuthorized(false);
      setError("❌ Invalid Admin Access Key");
    }
  };

  const fetchExam = async () => {
    const res = await getExam();
    setExam(res.data.exam);
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white p-4">
        <div className="bg-[#141417] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-primary">ADMIN GATEWAY</h1>
            <p className="text-gray-500 text-sm">Enter security key to manage event</p>
          </div>
          <input
            type="password"
            className="w-full p-4 mb-4 bg-[#0a0a0c] border border-white/10 rounded-xl focus:border-primary outline-none transition-all"
            placeholder="••••••••"
            onChange={(e) => setKey(e.target.value)}
          />
          <button onClick={() => verify(key)} className="bg-white text-black font-bold w-full py-4 rounded-xl hover:bg-primary transition-colors">
            Authorize Access
          </button>
          {error && <p className="text-red-500 text-sm mt-4 text-center animate-pulse">{error}</p>}
        </div>
      </div>
    );
  }

  if (!exam) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">Initializing...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-bold">Control Center</h1>
            <p className="text-gray-500">Manage your Bug Hunt live event</p>
          </div>
          <button onClick={() => { localStorage.removeItem("adminKey"); setAuthorized(false); }} className="text-red-400 text-sm hover:underline">Logout</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#141417] p-8 rounded-3xl border border-white/5">
            <h2 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">Event Status</h2>
            <div className="text-4xl font-black mb-4 flex items-center gap-3">
              <span className={`h-4 w-4 rounded-full ${exam.status === 'live' ? 'bg-green-500 animate-ping' : 'bg-yellow-500'}`}></span>
              {exam.status.toUpperCase()}
            </div>
            <div className="space-y-3">
              <button onClick={async () => { await startExam(); fetchExam(); }} className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all disabled:opacity-50" disabled={exam.status === 'live'}>▶ Open Exam</button>
              <button 
  onClick={async () => { 
    if(window.confirm("Are you sure you want to end the exam for everyone?")) {
      await endExam(); 
      fetchExam(); // Status turant 'ENDED' dikhayega
    }
  }} 
  className="w-full py-4 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all"
>
  ⏹ Shutdown Event
</button>
            </div>
          </div>

          <div className="bg-[#141417] p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div>
              <h2 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">Critical Actions</h2>
              <p className="text-sm text-gray-500 mb-6">Resetting will wipe all submissions and reset the timer. Use with caution.</p>
            </div>
            <button onClick={async () => { if(window.confirm("Delete all data?")) { await resetEvent(); fetchExam(); } }} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all">🔄 Full System Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;