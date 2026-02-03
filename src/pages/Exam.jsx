import { useEffect, useState, useCallback, useRef } from "react";
import { getExam, joinExam, submitExam, saveAnswer, updateTabCount } from "../api/exam.api";
import { getQuestions } from "../api/questions.api";

const Exam = () => {
  const userId = localStorage.getItem("userId");

  // States
  const [status, setStatus] = useState("loading"); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [escWarning, setEscWarning] = useState(false);

  // Refs for tracking
  const isAlerting = useRef(false);
  const escCount = useRef(0);

  // ================== 1. FULLSCREEN & INITIAL STATUS ==================
  const handleForceFS = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
      
      setIsFullScreen(true);
      setEscWarning(false);
      escCount.current = 0;

      if (status === "force-fs") setStatus("waiting");
    } catch (e) {
      alert("Fullscreen Mandatory!");
    }
  };

  useEffect(() => {
    if (status === "loading") setStatus("force-fs");
  }, [status]);

  // ================== 2. SYNC WITH ADMIN & START ==================
  useEffect(() => {
    if (status !== "waiting") return;
    const sync = async () => {
      try {
        const res = await getExam();
        if (res.data.exam.status === "live") setStatus("countdown");
        if (res.data.exam.status === "ended") handleFinalSubmit(false, "Admin Terminated");
      } catch (e) {}
    };
    const i = setInterval(sync, 2000); 
    return () => clearInterval(i);
  }, [status]);

  // 🔥 COUNTDOWN LOGIC
  useEffect(() => {
    if (status === "countdown") {
      if (countdown > 0) {
        const t = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(t);
      } else {
        startExamFlow(); 
      }
    }
  }, [status, countdown]);

  // 🔥 RE-SYNC TIME ON START
  const startExamFlow = async () => {
    try {
      const joinRes = await joinExam(userId);
      setTimeLeft(joinRes.data.remainingSeconds); 
      const qRes = await getQuestions();
      setQuestions(qRes.data.questions);
      setStatus("live");
    } catch (e) { 
      setStatus("waiting"); 
    }
  };

  // ================== 3. ANTI-CHEAT & RE-ENTRY ==================
  const handleFinalSubmit = useCallback(async (disqualified = false, reason = "") => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitExam({ userId, disqualified, reason });
      localStorage.setItem("examFlow", "ended");
      window.location.href = "/exit";
    } catch (e) { setSubmitting(false); }
  }, [userId, submitting]);

  const triggerTabWarning = useCallback(async () => {
    if (isAlerting.current || status !== "live" || submitting) return;
    isAlerting.current = true;
    try {
      const res = await updateTabCount({ userId });
      const count = res.data.tabCount || 1;
      if (count >= 2) {
        handleFinalSubmit(true, "Security Violation (Tab/Fullscreen)");
      } else {
        alert(`⚠️ WARNING (${count}/2): Multiple violations will lead to disqualification!`);
      }
    } catch (e) {}
    setTimeout(() => { isAlerting.current = false; }, 1000);
  }, [userId, status, submitting, handleFinalSubmit]);

  useEffect(() => {
    if (status !== "live") return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        escCount.current += 1;
        if (escCount.current === 1) {
          setEscWarning(true);
          setTimeout(() => { setEscWarning(false); escCount.current = 0; }, 3000);
        } else if (escCount.current >= 2) {
          document.exitFullscreen?.().catch(() => {});
        }
      }
    };

    const handleBlur = () => { if (!document.hasFocus() && status === "live") triggerTabWarning(); };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("blur", handleBlur);
    };
  }, [status, triggerTabWarning]);

  useEffect(() => {
    const fsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullScreen(fs);
      if (!fs && status === "live") triggerTabWarning();
    };
    document.addEventListener("fullscreenchange", fsChange);
    return () => document.removeEventListener("fullscreenchange", fsChange);
  }, [status, triggerTabWarning]);

  // 🔥 LIVE TICKER
  useEffect(() => {
    if (status === "live" && timeLeft > 0) {
      const i = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(i);
    }
    if (status === "live" && timeLeft === 0) handleFinalSubmit(false, "Time Over");
  }, [status, timeLeft, handleFinalSubmit]);

  // ================== 4. UI COMPONENTS ==================
  if (status === "force-fs") return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-orange-500">
      <h1 className="text-3xl font-black mb-8 italic tracking-tighter uppercase">Secure Mode Required</h1>
      <button onClick={handleForceFS} className="bg-orange-500 text-black px-12 py-5 rounded-2xl font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all">ENABLE FULLSCREEN</button>
    </div>
  );

  // 🔥 NEW ENHANCED WAITING PAGE
  if (status === "waiting") return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="max-w-md w-full bg-[#111] p-10 rounded-[3rem] border border-orange-500/20 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-black text-orange-500 text-center mb-6 italic uppercase tracking-tighter">Waiting for Admin...</h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
            <span className="text-orange-500 font-bold">01</span>
            <p className="text-xs text-gray-400 font-medium">Do NOT exit Fullscreen mode or switch tabs. (Max 2 Warnings)</p>
          </div>
          <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
            <span className="text-orange-500 font-bold">02</span>
            <p className="text-xs text-gray-400 font-medium">Avoid pressing ESC key. Double press will terminate your session.</p>
          </div>
          <div className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
            <span className="text-orange-500 font-bold">03</span>
            <p className="text-xs text-gray-400 font-medium">Timer is synced with the server. It will not pause for anyone.</p>
          </div>
        </div>

        <p className="text-[10px] text-center text-orange-500/50 font-black uppercase tracking-widest animate-pulse">Stay Focused • Stay Secure</p>
      </div>
    </div>
  );

  if (status === "countdown") return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-orange-500">
      <h2 className="text-xl font-black italic mb-4 animate-bounce">THE BATTLE BEGINS IN</h2>
      <div className="text-[12rem] font-black leading-none">{countdown}</div>
    </div>
  );

  const q = questions[current];
  return (
    <div className="min-h-screen bg-black text-white p-6 select-none">
      
      {!isFullScreen && status === "live" && (
        <div className="fixed inset-0 bg-black/95 z-[2000] flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
          <div className="bg-[#111] p-10 rounded-[3rem] border border-orange-500/20 max-w-sm">
            <h2 className="text-3xl font-black text-orange-500 mb-2 italic">SESSION PAUSED</h2>
            <p className="text-gray-500 mb-8 text-xs uppercase tracking-widest font-bold text-center">You exited secure mode. Violation logged.</p>
            <button onClick={handleForceFS} className="w-full bg-orange-500 text-black py-4 rounded-xl font-black shadow-xl shadow-orange-900/20">RESUME AT Q{current + 1}</button>
          </div>
        </div>
      )}

      {escWarning && isFullScreen && (
        <div className="fixed inset-0 bg-red-600/90 z-[3000] flex items-center justify-center pointer-events-none">
          <h1 className="text-4xl font-black text-white animate-pulse text-center uppercase tracking-tighter italic">⚠️ WARNING!<br/>Press ESC again to flag violation</h1>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-end mb-10 bg-[#111] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
          <div>
            <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Question</span>
            <h2 className="text-2xl font-bold font-mono italic">Q{current + 1} / {questions.length}</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Time Remaining</span>
            <h2 className={`text-4xl font-black font-mono ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-orange-500'}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </h2>
          </div>
        </div>

        {q && (
          <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/5 min-h-[480px] flex flex-col justify-between shadow-3xl">
            <div>
              <h3 className="text-2xl font-bold mb-10 leading-relaxed text-gray-200">{q.text}</h3>
              <div className="grid gap-4">
                {q.options.map((o, i) => (
                  <button key={i} onClick={() => { setAnswers({...answers, [q._id]: i}); saveAnswer({userId, questionId: q._id, selectedOption: i}); }}
                    className={`w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center gap-4 ${answers[q._id] === i ? "border-orange-500 bg-orange-500 text-black font-black scale-[1.01]" : "border-white/5 bg-black/40 hover:border-orange-500/30 text-gray-400"}`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs border ${answers[q._id] === i ? "bg-black/20 border-black/20 text-black" : "bg-[#1a1a1a] border-white/10"}`}>{String.fromCharCode(65 + i)}</span>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
              <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="text-orange-500 font-bold opacity-30 hover:opacity-100 disabled:opacity-0 transition-all text-xs tracking-widest uppercase">← Back</button>
              {current === questions.length - 1 ? 
                <button onClick={() => setShowConfirm(true)} className="bg-red-600 text-white px-10 py-4 rounded-xl font-black hover:bg-red-500 shadow-xl shadow-red-900/10">FINISH BATTLE</button> :
                <button onClick={() => setCurrent(c => c + 1)} className="bg-white text-black px-10 py-4 rounded-xl font-black hover:bg-gray-200 text-xs tracking-widest uppercase">Next →</button>
              }
            </div>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[2500] backdrop-blur-sm">
          <div className="bg-[#111] p-10 rounded-[3rem] border border-orange-500/20 text-center max-w-sm w-full">
            <h2 className="text-3xl font-black text-orange-500 mb-2 italic">SUBMIT?</h2>
            <p className="text-gray-500 mb-8 text-[10px] font-black uppercase tracking-[0.2em]">Verify your answers once more</p>
            <div className="grid gap-3">
              <button onClick={() => handleFinalSubmit(false, "Manual")} className="w-full py-5 bg-orange-500 text-black rounded-2xl font-black hover:bg-orange-400 shadow-xl shadow-orange-900/20">YES, SUBMIT</button>
              <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-white/5 text-gray-400 rounded-2xl font-bold">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CenterText is kept for other general loading cases if any
const CenterText = ({ text, showSpinner }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black text-orange-500">
    {showSpinner && <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>}
    <p className="font-black italic tracking-widest uppercase text-xs">{text}</p>
  </div>
);

export default Exam;