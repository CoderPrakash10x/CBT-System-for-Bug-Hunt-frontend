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

  if (loading) return <CenterText text="Establishing Standings..." showSpinner />;
  if (data.length === 0) return <CenterText text="No data in range" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 relative overflow-hidden">
      
      {/* 🌌 Cyber Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 border border-orange-500/30 rounded-full mb-4 bg-orange-500/5">
            <span className="text-orange-500 text-[10px] font-black tracking-[0.4em] uppercase">Evolvera Hackathon Series</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-2">
            HALL OF <span className="text-orange-500">FAME</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-[0.2em] uppercase text-xs">Real-time Bug Hunt Rankings</p>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#0c0c0e]/80 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                  <th className="p-8 text-left">Pos</th>
                  <th className="p-8 text-left">Hunter</th>
                  <th className="p-8 text-left">Affiliation</th>
                  <th className="p-8 text-left text-orange-500">Bugs Fixed</th>
                  <th className="p-8 text-left">Efficiency</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {data.map((row, i) => {
                  const isTopThree = row.rank <= 3 && !row.isDisqualified;
                  const rankColors = {
                    1: "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]",
                    2: "text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.4)]",
                    3: "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]"
                  };

                  return (
                    <tr
                      key={i}
                      className={`group transition-all duration-300 ${
                        row.isDisqualified
                          ? "bg-red-950/20 text-red-400/60"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* Rank */}
                      <td className="p-8">
                        {row.rank === "DQ" ? (
                          <div className="w-12 py-1 text-center rounded-lg border border-red-500/20 bg-red-500/10 text-[10px] font-black tracking-tighter">
                            ELIMINATED
                          </div>
                        ) : (
                          <span className={`text-3xl font-black italic ${isTopThree ? rankColors[row.rank] : "text-white/20"}`}>
                            {row.rank.toString().padStart(2, '0')}
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className={`text-lg font-bold tracking-tight ${!row.isDisqualified ? "group-hover:text-orange-500" : ""} transition-colors`}>
                            {row.name}
                          </span>
                          {row.isDisqualified && (
                            <span className="text-[9px] uppercase font-black text-red-500 mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span> {row.reason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* College */}
                      <td className="p-8">
                        <span className="text-gray-500 font-medium text-sm">
                          {row.college}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="p-8 font-mono">
                        <div className="flex items-end gap-1">
                            <span className={`text-4xl font-black ${row.isDisqualified ? "text-red-900" : "text-white"}`}>
                                {row.score < 10 ? `0${row.score}` : row.score}
                            </span>
                            <span className="text-[10px] text-gray-600 font-bold mb-2">PTS</span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="p-8">
                        <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {Math.floor(row.timeTaken / 60)}m {row.timeTaken % 60}s
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex flex-col items-center gap-4">
            <div className="w-px h-12 bg-gradient-to-b from-orange-500 to-transparent"></div>
            <p className="text-[10px] uppercase tracking-[0.6em] text-orange-500/40 font-black">
                Official Evolvera Standings
            </p>
        </div>
      </div>
    </div>
  );
};

const CenterText = ({ text, showSpinner }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
    {showSpinner && (
      <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}
    <p className="text-orange-500 font-black tracking-[0.5em] uppercase text-[10px] animate-pulse">
      {text}
    </p>
  </div>
);

export default Leaderboard;