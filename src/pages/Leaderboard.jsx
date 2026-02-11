import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/leaderboard.api";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await getLeaderboard();
      const rawData = res.data.leaderboard || [];

      const sortedData = [...rawData].sort((a, b) => {
        if (a.isDisqualified === b.isDisqualified) {
          return b.score - a.score;
        }
        return a.isDisqualified ? 1 : -1;
      });

      setData(sortedData);
    } catch (err) {
      console.error("Leaderboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const i = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(i);
  }, []);

  if (loading) return <CenterText text="Establishing Standings..." showSpinner />;
  if (data.length === 0) return <CenterText text="No data available" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-10 relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-orange-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-orange-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1 mb-4 border border-orange-500/30 rounded-full bg-orange-500/5">
            <span className="text-orange-500 text-[10px] font-black tracking-[0.35em] uppercase">
              Evolvera Hackathon Series
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter">
            HALL OF <span className="text-orange-500">FAME</span>
          </h1>

          <p className="mt-2 text-gray-500 text-xs uppercase tracking-[0.2em]">
            Overall Rankings
          </p>
        </div>

        {/* Table Card */}
        <div className="rounded-[2rem] border border-white/5 bg-[#0c0c0e]/80 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                  <th className="px-6 py-5 text-left">Pos</th>
                  <th className="px-6 py-5 text-left">Hunter</th>
                  <th className="px-6 py-5 text-left">Division</th>
                  <th className="px-6 py-5 text-left">Affiliation</th>
                  <th className="px-6 py-5 text-left text-orange-500">
                    Bugs Fixed
                  </th>
                  <th className="px-6 py-5 text-left">Efficiency</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {data.map((row, i) => {
                  const isTopThree = i < 3 && !row.isDisqualified;
                  const rankColors = {
                    0: "text-yellow-400",
                    1: "text-gray-300",
                    2: "text-orange-400",
                  };

                  return (
                    <tr
                      key={i}
                      className={`transition-colors ${
                        row.isDisqualified
                          ? "bg-red-950/20 text-red-400/60"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-6 py-5">
                        {row.isDisqualified ? (
                          <span className="inline-block w-14 text-center py-1 rounded-md border border-red-500/40 bg-red-500/20 text-[10px] font-black uppercase">
                            DQ
                          </span>
                        ) : (
                          <span
                            className={`text-2xl font-black italic ${
                              isTopThree
                                ? rankColors[i]
                                : "text-white/20"
                            }`}
                          >
                            {(i + 1).toString().padStart(2, "0")}
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span
                            className={`font-bold ${
                              row.isDisqualified
                                ? "text-red-400/60"
                                : "text-white"
                            }`}
                          >
                            {row.name}
                          </span>
                          {row.isDisqualified && (
                            <span className="text-[9px] uppercase font-black text-red-600 mt-1">
                              SYSTEM BREACH
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Division */}
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1 rounded-md text-[10px] font-bold border ${
                            row.division === "A"
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                              : "bg-purple-500/10 border-purple-500/20 text-purple-500"
                          } ${row.isDisqualified ? "opacity-40" : ""}`}
                        >
                          {row.division === "A" ? "JUNIOR" : "SENIOR"} (YR{" "}
                          {row.year})
                        </span>
                      </td>

                      {/* College */}
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {row.college}
                      </td>

                      {/* Score */}
                      <td className="px-6 py-5 font-mono">
                        <span className="text-3xl font-black">
                          {row.score < 10 ? `0${row.score}` : row.score}
                        </span>
                        <span className="ml-1 text-[10px] text-gray-500">
                          PTS
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-5 font-mono text-sm text-gray-400">
                        {Math.floor(row.timeTaken / 60)}m{" "}
                        {row.timeTaken % 60}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= LOADER ================= */

const CenterText = ({ text, showSpinner }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
    {showSpinner && (
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}
    <p className="text-orange-500 font-black tracking-[0.4em] uppercase text-[10px] text-center animate-pulse">
      {text}
    </p>
  </div>
);

export default Leaderboard;
