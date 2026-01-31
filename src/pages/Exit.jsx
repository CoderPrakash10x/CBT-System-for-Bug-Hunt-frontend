const Exit = () => {
  const flow = localStorage.getItem("examFlow");

  if (flow !== "ended") {
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl text-center">
        <h1 className="text-xl font-bold mb-3">Exam Completed 🎉</h1>
        <a
          href="/leaderboard"
          className="bg-primary text-black px-4 py-2 rounded"
        >
          View Leaderboard
        </a>
      </div>
    </div>
  );
};

export default Exit;
