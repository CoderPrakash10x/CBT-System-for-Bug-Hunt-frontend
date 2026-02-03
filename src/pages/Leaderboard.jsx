import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/leaderboard.api";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await getLeaderboard();
      setData(res.data.leaderboard || []);
      setLoading(false);
    } catch (err) {
      console.error("Leaderboard Error:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const i = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(i);
  }, []);

  if (loading) return <CenterText text="Loading rankings..." showSpinner />;
  if (data.length === 0) return <CenterText text="No submissions yet" />;

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      
      {/* 🔥 Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[140px]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black italic tracking-tighter text-orange-500 mb-2">
            LEADERBOARD
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-orange-500/50 font-bold">
            Final Rankings
          </p>
        </div>

        <div className="overflow-x-auto rounded-[2.5rem] border border-white/5 bg-[#111] shadow-2xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.3em] text-orange-500/60 border-b border-white/5">
                <th className="p-6 text-left">Rank</th>
                <th className="p-6 text-left">Participant</th>
                <th className="p-6 text-left">College</th>
                <th className="p-6 text-left">Score</th>
                <th className="p-6 text-left">Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {data.map((row, i) => (
                <tr
                  key={i}
                  className={`transition-all ${
                    row.isDisqualified
                      ? "bg-red-600/5 text-red-400"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* Rank */}
                  <td className="p-6 font-black">
                    {row.rank === "DQ" ? (
                      <span className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-black tracking-widest">
                        DQ
                      </span>
                    ) : (
                      <span className="text-xl font-black text-orange-500">
                        #{row.rank}
                      </span>
                    )}
                  </td>

                  {/* Name */}
                  <td className="p-6">
                    <div className="font-bold text-white">
                      {row.name}
                    </div>
                    {row.isDisqualified && (
                      <div className="text-[10px] uppercase tracking-widest text-red-400 mt-1">
                        {row.reason}
                      </div>
                    )}
                  </td>

                  {/* College */}
                  <td className="p-6 text-gray-400 text-sm">
                    {row.college}
                  </td>

                  {/* Score */}
                  <td className="p-6 font-mono text-2xl font-black">
                    {row.isDisqualified ? "00" : row.score}
                  </td>

                  {/* Time */}
                  <td className="p-6 font-mono text-sm text-gray-400">
                    {Math.floor(row.timeTaken / 60)}m{" "}
                    {row.timeTaken % 60}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-12 text-center text-[10px] uppercase tracking-[0.4em] text-orange-500/40 font-black">
          Powered by Evolvera Club
        </p>
      </div>
    </div>
  );
};

const CenterText = ({ text, showSpinner }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black text-orange-500">
    {showSpinner && (
      <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-6"></div>
    )}
    <p className="font-black italic tracking-widest uppercase text-xs">
      {text}
    </p>
  </div>
);

export default Leaderboard;
