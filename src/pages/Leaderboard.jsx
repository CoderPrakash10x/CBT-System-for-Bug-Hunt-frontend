import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/leaderboard.api";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const res = await getLeaderboard();
    setData(res.data.leaderboard || []);
    setLoading(false);
  };

  if (loading) {
    return <CenterText text="Loading leaderboard..." />;
  }

  if (data.length === 0) {
    return <CenterText text="No submissions yet" />;
  }

 // ... (imports same rahenge)

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-tighter mb-4 italic">RANKINGS</h1>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/5 bg-[#141417]/50 backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest">
                <th className="p-6">Rank</th>
                <th className="p-6">Contestant</th>
                <th className="p-6">College</th>
                <th className="p-6">Score</th>
                <th className="p-6">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row, i) => (
                <tr key={i} className={`group transition-colors ${i === 0 ? 'bg-yellow-500/5' : 'hover:bg-white/5'}`}>
                  <td className="p-6">
                    {row.isDisqualified ? (
                      <span className="text-red-500 font-bold text-xs bg-red-500/10 px-3 py-1 rounded-full uppercase">DQ</span>
                    ) : (
                      <span className={`text-xl font-black ${i < 3 ? 'text-primary' : 'text-gray-500'}`}>
                        #{i + 1}
                      </span>
                    )}
                  </td>
                  <td className="p-6 font-bold">{row.name}</td>
                  <td className="p-6 text-gray-500 text-sm">{row.college}</td>
                  <td className="p-6">
                    <span className="text-xl font-mono">{row.isDisqualified ? "—" : row.score}</span>
                  </td>
                  <td className="p-6 text-gray-500 font-mono text-sm">
                    {Math.floor(row.timeTaken / 60)}m {row.timeTaken % 60}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CenterText = ({ text }) => (
  <div className="min-h-screen flex items-center justify-center text-xl">
    {text}
  </div>
);

export default Leaderboard;
