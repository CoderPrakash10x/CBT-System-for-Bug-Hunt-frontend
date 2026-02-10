import { useEffect, useState, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import { getExam, joinExam, submitExam } from "../api/exam.api";
import { getQuestions } from "../api/questions.api";
import API from "../api/axios";

const Exam = () => {
  const userId = localStorage.getItem("userId");

  const [status, setStatus] = useState("loading");
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ show: false, message: "" });
  const [isFs, setIsFs] = useState(true); 
  const [isReady, setIsReady] = useState(false); 

  const timerRef = useRef(null);
  const savingRef = useRef(false);

  /* ================= UI UTILS ================= */
  const showAlert = (msg) => {
    setModal({ show: true, message: msg });
    setTimeout(() => setModal({ show: false, message: "" }), 4000);
  };

  const enterFullscreen = () => {
    const el = document.documentElement;
    const requestFs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen;
    if (requestFs) {
      requestFs.call(el)
        .then(() => {
          setIsFs(true);
          if (status === "countdown" || isReady) {
            startExamFlow();
          }
        })
        .catch(() => {
          setIsFs(false);
          showAlert("Grant Fullscreen Permission to Continue!");
        });
    }
  };

  /* ================= FINAL SUBMIT ================= */
  const handleFinalSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Pehle backend ko submit karo
      await submitExam({ userId });
      localStorage.removeItem("examStarted");
      
      // Success ke baad hi fullscreen exit karo
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      window.location.href = "/exit";
    } catch (err) {
      console.error("Submission failed", err);
      setSubmitting(false);
      showAlert("Submission Failed! Try again.");
    }
  }, [userId, submitting]);

  /* ================= ADMIN SYNC ================= */
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await getExam();
        const examStatus = res.data.exam.status;
        if (examStatus === "ended") {
          handleFinalSubmit();
          return;
        }
        if (status === "loading" || status === "waiting") {
          if (examStatus === "live") setStatus("countdown");
          else setStatus("waiting");
        }
      } catch {
        if (status === "loading") setStatus("waiting");
      }
    };
    poll();
    const i = setInterval(poll, 5000);
    return () => clearInterval(i);
  }, [status, handleFinalSubmit]);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (status !== "countdown") return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setIsReady(true); // Enable "Start" button instead of auto-start
    }
  }, [status, countdown]);

  /* ================= START EXAM ================= */
  const startExamFlow = async () => {
    try {
      if (!userId) return (window.location.href = "/");
      
      const [joinRes, qRes] = await Promise.all([
        joinExam(userId),
        getQuestions(userId),
      ]);

      setTimeLeft(joinRes.data.remainingSeconds);
      const fetchedQs = qRes.data.questions || [];
      
      if (!fetchedQs.length) {
        showAlert("No questions assigned yet!");
        setStatus("waiting");
        return;
      }

      setQuestions(fetchedQs.map((q) => ({ ...q, code: q.buggyCode })));
      setStatus("live");
      setIsReady(false);
    } catch (err) {
      setStatus("waiting");
    }
  };

  /* ================= LIVE TIMER ================= */
  useEffect(() => {
    if (status !== "live") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [status, handleFinalSubmit]);

  /* ================= ANTI-CHEAT (HARDENED) ================= */
  useEffect(() => {
    if (status !== "live") return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "STRICT LOCKDOWN: Don't refresh!"; 
    };

    const handleKeydown = (e) => {
      if (
        e.keyCode === 116 || (e.ctrlKey && e.keyCode === 82) || 
        e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        showAlert("ACTION RESTRICTED: Investigation Logged.");
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        API.post("/exam/update-tab-count", { userId }).catch(() => {});
        showAlert("WARNING: Tab switch detected! Admin notified.");
      }
    };

    const fsChange = () => {
      if (!document.fullscreenElement && !submitting) {
        setIsFs(false);
        API.post("/exam/update-tab-count", { userId }).catch(() => {});
      } else {
        setIsFs(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", fsChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", fsChange);
    };
  }, [status, userId, submitting]);

  /* ================= UI STATES ================= */
  if (status === "loading" || status === "waiting")
    return <Center text="Establishing Secure Connection..." spinner />;

  if (status === "countdown")
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-orange-500 text-sm font-black tracking-[0.5em] mb-4">LOCKING INTERFACE</div>
        <div className="text-[14rem] font-black text-white leading-none mb-10">{countdown}</div>
        
        {isReady && (
          <button 
            onClick={enterFullscreen}
            className="px-16 py-6 bg-orange-500 text-black font-black text-2xl rounded-2xl animate-pulse shadow-[0_0_50px_rgba(249,115,22,0.4)] transition-transform active:scale-95"
          >
            START HUNT
          </button>
        )}
      </div>
    );

  if (status === "live") {
    if (!questions.length) return <Center text="Fetching Questions..." spinner />;
    const q = questions[current];

    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white p-4 font-sans select-none">
        
        {/* RE-ENTRY OVERLAY */}
        {!isFs && !submitting && (
          <div className="fixed inset-0 z-[1000] bg-black/95 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
            <h2 className="text-orange-500 text-5xl font-black italic mb-4">SYSTEM BREACH</h2>
            <p className="text-gray-400 max-w-md mb-8 uppercase tracking-widest text-sm font-bold">
              Secure environment compromised. Re-enter fullscreen to continue.
            </p>
            <button 
              onClick={enterFullscreen}
              className="px-12 py-5 bg-orange-500 text-black font-black rounded-2xl shadow-[0_0_50px_rgba(249,115,22,0.2)]"
            >
              RESTORE CONNECTION
            </button>
          </div>
        )}

        {modal.show && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[999] bg-red-600 text-white px-8 py-4 rounded-full font-black animate-bounce">
            ⚠️ {modal.message}
          </div>
        )}

        <div className="max-w-[1600px] mx-auto">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4 bg-[#141417] p-4 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="font-black text-2xl tracking-tighter italic">BUG<span className="text-orange-500">HUNT</span></span>
            </div>
            
            <div className="bg-black/50 px-8 py-2 rounded-xl border border-orange-500/20 font-mono text-4xl font-black text-orange-500">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>

            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Progress</p>
              <p className="font-black text-orange-500">{current + 1} / {questions.length}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 bg-[#141417] p-8 rounded-[2rem] border border-white/5 h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
              <div className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md mb-4 text-orange-500 text-[10px] font-black uppercase tracking-widest">Task Definition</div>
              <h2 className="text-2xl font-bold mb-6 leading-tight">{q.problemStatement}</h2>
              {/* Constraints & Examples sections same as before */}
            </div>

            <div className="lg:col-span-8 rounded-[2rem] overflow-hidden border-2 border-white/5 relative group">
              <Editor
                height="calc(100vh - 180px)"
                theme="vs-dark"
                language={q.language === "c" ? "cpp" : q.language}
                value={q.code}
                onChange={(val) => {
                  setQuestions((prev) => {
                    const copy = [...prev];
                    copy[current].code = val;
                    return copy;
                  });
                }}
                options={{ fontSize: 18, minimap: { enabled: false }, contextmenu: false }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
              className={`px-10 py-4 rounded-2xl font-black transition-all ${current === 0 ? 'opacity-20' : 'bg-white/5 hover:bg-white/10'}`}
            >PREVIOUS</button>

            <button
              onClick={() => {
                if (current === questions.length - 1) {
                  if (window.confirm("FINAL SUBMISSION?")) handleFinalSubmit();
                } else {
                  if (savingRef.current) return;
                  savingRef.current = true;
                  API.post("/exam/submit-code", { userId, questionId: q._id, code: q.code }).finally(() => { savingRef.current = false; });
                  setCurrent((c) => c + 1);
                }
              }}
              className="px-12 py-4 bg-orange-500 hover:bg-orange-600 text-black rounded-2xl font-black shadow-lg"
            >
              {current === questions.length - 1 ? (submitting ? "SYNCING..." : "FINISH") : "SAVE & NEXT"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const Center = ({ text, spinner }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b] gap-8">
    {spinner && <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>}
    <div className="text-orange-500 font-black tracking-widest uppercase text-center px-4">{text}</div>
  </div>
);

export default Exam;