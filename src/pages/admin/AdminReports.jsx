import { useEffect, useState } from "react";
import { getAllSubmissions, getUserReport } from "../../api/adminReport.api";

const AdminReports = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllSubmissions();
        setUsers(res.data.submissions || []);
      } catch (err) {
        console.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const openReport = async (userId) => {
    setSelected(userId);
    setReport(null);
    try {
      const res = await getUserReport(userId);
      setReport(res.data.report);
    } catch {
      alert("Failed to load report");
    }
  };

  if (loading) return <AdminLoader />;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 grid grid-cols-12 gap-6 h-screen overflow-hidden">
      
      {/* ================= LEFT: PARTICIPANTS LIST ================= */}
      <div className="col-span-4 bg-[#0d0d0f] rounded-[2rem] p-6 flex flex-col border border-white/5 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em]">
                Live Submissions ({users.length})
            </h2>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {users.length === 0 && (
            <div className="text-center py-20 text-gray-600 text-xs uppercase tracking-widest font-bold">No Data Received</div>
          )}

          {users.map((u) => (
            <button
              key={u.userId}
              onClick={() => openReport(u.userId)}
              className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                  selected === u.userId
                    ? "bg-orange-500 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                    : "bg-[#141417] border-white/5 hover:border-orange-500/50"
                }`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className={`font-black tracking-tight text-lg ${selected === u.userId ? "text-black" : "text-white group-hover:text-orange-500"}`}>
                        {u.name}
                    </div>
                    <div className={`text-[10px] font-bold uppercase ${selected === u.userId ? "text-black/60" : "text-gray-500"}`}>
                        {u.college}
                    </div>
                </div>
                <div className="text-right">
                    <div className={`font-mono font-black ${selected === u.userId ? "text-black" : "text-orange-500"}`}>
                        {u.score} pts
                    </div>
                    {u.isDisqualified && (
                      <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-tighter">DQ</span>
                    )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ================= RIGHT: DETAILED REPORT ================= */}
      <div className="col-span-8 bg-[#0d0d0f] rounded-[2rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
        {!report && !selected && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
                <div className="text-8xl mb-4">📄</div>
                <p className="font-black tracking-[0.5em] text-xs uppercase text-orange-500">Select Intelligence to Decrypt</p>
            </div>
        )}

        {selected && !report && (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

        {report && (
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {/* USER HEADER */}
            <div className="mb-12 flex justify-between items-end border-b border-white/5 pb-8">
              <div>
                <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">
                  {report.user.name.toUpperCase()}
                </h1>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span className="text-orange-500">{report.user.email}</span>
                  <span>•</span>
                  <span>{report.user.college}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Total Performance</p>
                <div className="text-4xl font-mono font-black text-orange-500 leading-none">
                    {report.score} / {report.questions.length * 10}
                </div>
              </div>
            </div>

            {/* SECURITY LOG */}
            {report.isDisqualified && (
                <div className="mb-10 bg-red-600/10 border border-red-600/30 p-6 rounded-2xl">
                    <h4 className="text-red-500 font-black text-xs uppercase tracking-[0.3em] mb-2">Violation Detected</h4>
                    <p className="text-red-200 text-lg font-bold italic">“{report.reason}”</p>
                </div>
            )}

            {/* QUESTIONS BREAKDOWN */}
            <div className="space-y-12">
              {report.questions.map((q, qi) => (
                <div key={qi} className="relative group">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-white/5 text-gray-500 px-3 py-1 rounded text-xs font-mono">Q.{qi+1}</span>
                    <h3 className="font-black text-xl text-white group-hover:text-orange-500 transition-colors">
                        {q.questionCode || "Bug Fix Task"}
                    </h3>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-6 pl-2 border-l-2 border-orange-500/20">
                    {q.problemStatement}
                  </p>

                  <div className="grid grid-cols-1 gap-6">
                    <Block title="Initial Buggy Code" code={q.buggyCode} color="text-red-400" />
                    
                    <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-orange-500/60 mb-3 font-black">Submission Timeline</h4>
                        <div className="space-y-4">
                        {q.attempts.map((a) => (
                            <div key={a.attemptNo} className="bg-[#141417] border border-white/5 rounded-2xl overflow-hidden">
                                <div className={`px-4 py-2 text-[10px] font-black flex justify-between items-center ${a.verdict === "ACCEPTED" ? "bg-green-600/20 text-green-500" : "bg-red-600/20 text-red-500"}`}>
                                    <span>ATTEMPT #{a.attemptNo}</span>
                                    <span>{a.verdict}</span>
                                </div>
                                <pre className="p-5 text-[13px] font-mono text-gray-300 overflow-x-auto leading-relaxed">
                                    {a.code}
                                </pre>
                            </div>
                        ))}
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Block = ({ title, code, color }) => (
  <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
    <h4 className={`text-[10px] uppercase tracking-widest ${color || "text-orange-500/60"} mb-3 font-black`}>
      {title}
    </h4>
    <pre className="text-[13px] font-mono text-gray-400 overflow-x-auto leading-relaxed">
      {code}
    </pre>
  </div>
);

const AdminLoader = () => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-1 w-16 bg-orange-500/20 rounded-full relative overflow-hidden mb-4">
            <div className="absolute inset-0 bg-orange-500 w-1/2 animate-[loading_1s_infinite_ease-in-out]"></div>
        </div>
        <p className="text-orange-500 font-black text-[10px] tracking-[0.5em] uppercase animate-pulse">Synchronizing Data</p>
    </div>
);

export default AdminReports;