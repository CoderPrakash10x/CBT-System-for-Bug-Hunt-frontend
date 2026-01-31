import { useEffect, useState, useCallback } from "react";
import { getExam, joinExam, submitExam, saveAnswer } from "../api/exam.api";
import { getQuestions } from "../api/questions.api";

const Exam = () => {
  const userId = localStorage.getItem("userId");
  const flow = localStorage.getItem("examFlow");

  // State Management
  const [status, setStatus] = useState("loading");
  const [timeLeft, setTimeLeft] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tabCount, setTabCount] = useState(0);
  const [warned, setWarned] = useState(false);
  const [forceSubmitted, setForceSubmitted] = useState(false);

  // 1. Auth Guard
  useEffect(() => {
    if (!userId || (flow !== "waiting" && flow !== "live")) {
      window.location.href = "/";
    }
  }, [userId, flow]);

  // 2. Start Exam Logic
  const startExamFlow = useCallback(async () => {
    try {
      localStorage.setItem("examFlow", "live");
      const joinRes = await joinExam(userId);
      setTimeLeft(joinRes.data.remainingSeconds);

      const qRes = await getQuestions();
      setQuestions(qRes.data.questions);
      setStatus("live");
    } catch (e) {
      console.error("Flow Error", e);
    }
  }, [userId]);

  // 3. Status Polling (Admin End karega toh redirect hoga)
  const checkExamStatus = useCallback(async () => {
    try {
      const res = await getExam();
      const exam = res.data.exam;

      if (exam.status === "waiting") {
        setStatus("waiting");
      } else if (exam.status === "live") {
        if (status !== "live") startExamFlow();
      } else if (exam.status === "ended") {
        localStorage.setItem("examFlow", "ended");
        window.location.href = "/exit";
      }
    } catch (e) {
      console.error("Check Error", e);
    }
  }, [status, startExamFlow]);

  useEffect(() => {
    checkExamStatus(); // Initial check
    const interval = setInterval(checkExamStatus, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [checkExamStatus]);

  // 4. Countdown Timer
  useEffect(() => {
    if (status !== "live" || timeLeft <= 0) return;
    const i = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(i);
  }, [status, timeLeft]);

  // 5. Submit Handlers
  const handleSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const res = await submitExam({ userId });
      if (res.data.success) {
        localStorage.setItem("examFlow", "ended");
        window.location.href = "/exit";
      }
    } catch (e) {
      console.error("Submit Error", e);
      alert("Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const autoSubmitDisqualified = useCallback(async () => {
    if (forceSubmitted) return;
    setForceSubmitted(true);
    await submitExam({ userId, disqualified: true });
    localStorage.setItem("examFlow", "ended");
    window.location.href = "/exit";
  }, [userId, forceSubmitted]);

  // 6. Anti-Cheat (Tab Detection)
  useEffect(() => {
    if (status !== "live") return;
    const handleVisibility = () => { if (document.hidden) setTabCount((c) => c + 1); };
    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, [status]);

  useEffect(() => {
    if (tabCount === 1 && !warned) {
      alert("⚠️ Warning! Tab switch detected. Next time you will be disqualified.");
      setWarned(true);
    }
    if (tabCount >= 2) autoSubmitDisqualified();
  }, [tabCount, warned, autoSubmitDisqualified]);

  // 7. Timer Auto-Submit
  useEffect(() => {
    if (timeLeft === 0 && status === "live" && !submitting) handleSubmit();
  }, [timeLeft, status]);

  const selectOption = async (qid, index) => {
    setAnswers({ ...answers, [qid]: index });
    await saveAnswer({ userId, questionId: qid, selectedOption: index });
  };

  if (status === "loading") return <CenterText text="Loading System..." />;
  if (status === "waiting") return <CenterText text="Waiting for admin to start exam..." />;

  const q = questions[current];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-end mb-8 bg-[#141417] p-6 rounded-2xl border border-white/5">
          <div>
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Question {current + 1} of {questions.length}</h2>
            <div className="h-1.5 w-48 bg-white/10 mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((current + 1) / questions.length) * 100}%` }}></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Time Remaining</p>
            <span className={`font-mono text-2xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {tabCount > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
            <span className="h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
            Warning: Tab Switch Detected ({tabCount}/2)
          </div>
        )}

        {q && (
          <div className="bg-[#141417] border border-white/5 p-8 rounded-3xl shadow-xl min-h-[400px] flex flex-col justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-medium leading-relaxed mb-8">{q.text}</h3>
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => selectOption(q._id, i)}
                    className={`group w-full p-5 rounded-2xl text-left transition-all border flex items-center gap-4 ${answers[q._id] === i ? "bg-white text-black border-white" : "bg-[#0a0a0c] border-white/5 hover:border-white/20"
                      }`}
                  >
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${answers[q._id] === i ? "bg-black text-white" : "bg-white/5 text-gray-400"}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
              <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="px-6 py-3 rounded-xl font-bold hover:bg-white/5 disabled:opacity-0">← Back</button>
              {current === questions.length - 1 ? (
                <button onClick={() => setShowConfirm(true)} className="bg-red-600 hover:bg-red-500 px-10 py-3 rounded-xl font-bold shadow-lg shadow-red-600/20">Finish Exam</button>
              ) : (
                <button onClick={() => setCurrent(c => c + 1)} className="bg-white text-black px-10 py-3 rounded-xl font-bold">Next Question</button>
              )}
            </div>
          </div>
        )}
      </div>
      {showConfirm && <ConfirmModal onCancel={() => setShowConfirm(false)} onConfirm={handleSubmit} />}
    </div>
  );
};

const ConfirmModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
    <div className="bg-[#141417] border border-white/10 p-8 rounded-3xl w-full max-w-sm text-center">
      <h3 className="text-xl font-bold mb-2 text-white">Final Submit?</h3>
      <p className="text-gray-400 mb-6">Review your answers. You cannot go back after this.</p>
      <div className="flex justify-center gap-3">
        <button onClick={onCancel} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold">Review</button>
        <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold">Submit</button>
      </div>
    </div>
  </div>
);

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const CenterText = ({ text }) => <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white text-xl font-medium"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>{text}</div>;

export default Exam;