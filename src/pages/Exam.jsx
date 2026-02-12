import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getExam, joinExam, submitExam } from "../api/exam.api";
import { getQuestions } from "../api/questions.api";
import API from "../api/axios";

const Exam = () => {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [isFs, setIsFs] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [canTrack, setCanTrack] = useState(false);

  // 🔥 NEW STATES
  const [violations, setViolations] = useState(0);
  const [popup, setPopup] = useState({
    show: false,
    type: "", // "warning" | "submit"
    message: "",
  });

  const examStartedRef = useRef(false);
  const isFinishedRef = useRef(false);
  const timerRef = useRef(null);
  const editorRef = useRef(null);

  /* ================= RIGHT CLICK BLOCK ================= */
  useEffect(() => {
    const blockRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", blockRightClick);
    return () => document.removeEventListener("contextmenu", blockRightClick);
  }, []);


  /* ================= CLEAN SESSION ================= */
  useEffect(() => {
    if (!userId) {
      navigate("/", { replace: true });
      return;
    }

    if (!localStorage.getItem("examStarted")) {
      localStorage.removeItem("examFinished");
      localStorage.removeItem("disqualified");
    }
  }, [userId, navigate]);

  /* ================= FULLSCREEN ================= */
  const enterFullscreen = () => {
    const el = document.documentElement;
    el.requestFullscreen?.()
      .then(() => {
        setIsFs(true);
        setTimeout(() => setCanTrack(true), 1500);
      })
      .catch(() => setIsFs(false));
  };

  /* ================= FINAL SUBMIT ================= */
  const handleFinalSubmit = useCallback(async (reason = "normal") => {
    if (submitting || isFinishedRef.current) return;
    isFinishedRef.current = true;
    setSubmitting(true);

    try {
      if (reason === "disqualified") {
        localStorage.setItem("disqualified", "true");
      }
      await submitExam({
        userId,
        reason: reason // "disqualified" | "normal"
      });
    } finally {
      localStorage.setItem("examFinished", "true");
      localStorage.removeItem("examStarted");
      document.fullscreenElement && document.exitFullscreen();
      navigate("/exit", { replace: true });
    }
  }, [userId, submitting, navigate]);

  /* ================= ANTI-CHEAT (FIXED FLOW) ================= */
  useEffect(() => {
    if (!canTrack || isFinishedRef.current) return;

    const triggerViolation = () => {
      setViolations(prev => {
        const count = prev + 1;

        // ⚠️ FIRST TIME → WARNING
        if (count === 1) {
          setCanTrack(false);
          setIsFs(false);
          setPopup({
            show: true,
            type: "warning",
            message:
              "⚠️ Warning: Tab switching or fullscreen exit detected. One more violation will disqualify you.",
          });
        }

        // ❌ SECOND TIME → DISQUALIFY
        if (count >= 2) {
          handleFinalSubmit("disqualified");
        }

        return count;
      });
    };

    const onBlur = () => triggerViolation();
    const onVisibility = () => document.hidden && triggerViolation();
    const onFsChange = () =>
      !document.fullscreenElement && triggerViolation();

    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [canTrack, handleFinalSubmit]);

  /* ================= EXAM POLLING ================= */
  useEffect(() => {
    const poll = async () => {
      if (isFinishedRef.current) return;
      const res = await getExam();
      const s = res.data.exam.status;

      if (localStorage.getItem("examFinished")) {
        navigate("/exit", { replace: true });
        return;
      }

      if (s === "ended") handleFinalSubmit();
      if (status === "loading" || status === "waiting") {
        setStatus(s === "live" ? "countdown" : "waiting");
      }
    };

    poll();
    const i = setInterval(poll, 5000);
    return () => clearInterval(i);
  }, [status, handleFinalSubmit, navigate]);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (status !== "countdown") return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    setIsReady(true);
  }, [status, countdown]);

  /* ================= START EXAM ================= */
  const startExamFlow = async () => {
    const [joinRes, qRes] = await Promise.all([
      joinExam(userId),
      getQuestions(userId),
    ]);

    if (joinRes.data.isDisqualified) {
      navigate("/exit", { replace: true });
      return;
    }

    setTimeLeft(joinRes.data.remainingSeconds);
    const qs = qRes.data.questions || [];
    setQuestions(qs.map(q => ({ ...q, code: q.buggyCode })));

    localStorage.setItem("examStarted", "true");
    examStartedRef.current = true;
    setStatus("live");
    setIsReady(false);
    enterFullscreen();
  };

  useEffect(() => {
  if (status !== "live") return;

  const t = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(t);
        handleFinalSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(t);
}, [status, handleFinalSubmit]);


 useEffect(() => {
  if (status !== "live") return;

  const sync = async () => {
    try {
      const res = await getExam();
      const exam = res.data.exam;
      if (!exam?.endTime) return;

      const serverRemaining = Math.max(
        Math.floor(
          (new Date(exam.endTime).getTime() - Date.now()) / 1000
        ),
        0
      );

      setTimeLeft(prev => {
        // 🛡 correct ONLY if drift > 5 sec
        if (Math.abs(prev - serverRemaining) > 5) {
          return serverRemaining;
        }
        return prev;
      });

      if (serverRemaining <= 0) {
        handleFinalSubmit();
      }
    } catch {}
  };

  const i = setInterval(sync, 15000);
  return () => clearInterval(i);
}, [status, handleFinalSubmit]);




  /* ================= UI STATES ================= */
  if (status === "loading" || status === "waiting") {
    return <Center text="Establishing Secure Connection..." spinner />;
  }

  if (status === "countdown") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-orange-500 text-xs font-black tracking-[0.4em] mb-6">
          Now The Wait is Over Prepare for hunting...
        </div>
        <div className="text-[9rem] font-black">{countdown}</div>
        {isReady && (
          <button
            onClick={startExamFlow}
            className="px-14 py-5 bg-orange-500 text-black font-black rounded-2xl animate-pulse"
          >
            START HUNT
          </button>
        )}
      </div>
    );
  }

  const q = questions?.[current];

  if (!q) {
    return <Center text="Loading Question..." spinner />;
  }


  return (
    <div className="h-screen bg-[#0a0a0b] text-white p-4 flex flex-col">

      {/* 🔔 WARNING POPUP */}
      {popup.show && popup.type === "warning" && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center">
          <div className="bg-[#141417] border border-orange-500/40 rounded-2xl p-8 max-w-md text-center">
            <h2 className="text-orange-500 font-black text-xl mb-4">
              SECURITY WARNING
            </h2>
            <p className="text-gray-300 mb-6">{popup.message}</p>
            <button
              onClick={() => {
                setPopup({ show: false, type: "", message: "" });
                enterFullscreen();
              }}
              className="px-10 py-3 bg-orange-500 text-black font-black rounded-xl"
            >
              RE-ENTER FULLSCREEN
            </button>
          </div>
        </div>
      )}

      {/* 🔔 SUBMIT POPUP */}
      {popup.show && popup.type === "submit" && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center">
          <div className="bg-[#141417] border border-white/10 rounded-2xl p-8 max-w-md text-center">
            <h2 className="text-orange-500 font-black text-xl mb-4">
              FINAL SUBMISSION
            </h2>
            <p className="text-gray-300 mb-8">{popup.message}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setPopup({ show: false, type: "", message: "" })}
                className="px-6 py-3 bg-white/10 rounded-xl font-black"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleFinalSubmit()}
                className="px-6 py-3 bg-orange-500 text-black rounded-xl font-black"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN BLOCK */}
      {!isFs && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <button
            onClick={enterFullscreen}
            className="px-12 py-5 bg-orange-500 text-black font-black rounded-2xl"
          >
            RE-ENTER FULLSCREEN
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between bg-[#141417] px-6 py-4 rounded-2xl mb-4">
        <span className="font-black italic text-2xl">
          BUG<span className="text-orange-500">HUNT</span>
        </span>
        <span className="font-mono text-orange-500 text-2xl">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        <span className="font-black text-orange-500">
          {current + 1}/{questions.length}
        </span>
      </div>

      {/* BODY */}
      <div className="grid lg:grid-cols-12 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-4 bg-[#141417] p-6 rounded-2xl overflow-y-auto space-y-6">

          {/* PROBLEM STATEMENT */}
          <div>
            <h2 className="text-orange-500 font-black text-lg mb-2 uppercase tracking-wide">
              Problem Statement
            </h2>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
              {q.problemStatement}
            </p>
          </div>

          {/* CONSTRAINTS */}
          {q.constraints?.length > 0 && (
            <div>
              <h3 className="text-orange-500 font-black text-sm mb-2 uppercase">
                Constraints
              </h3>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                {q.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* EXAMPLES */}
          {/* {q.examples?.length > 0 && (
            <div>
              <h3 className="text-orange-500 font-black text-sm mb-2 uppercase">
                Examples
              </h3>

              <div className="space-y-3">
                {q.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="bg-black/40 border border-white/5 rounded-xl p-3 text-sm"
                  >
                    <div className="mb-1">
                      <span className="text-orange-400 font-bold">Input:</span>
                      <pre className="text-gray-300 whitespace-pre-wrap">
                        {ex.input}
                      </pre>
                    </div>
                    <div>
                      <span className="text-orange-400 font-bold">Output:</span>
                      <pre className="text-gray-300 whitespace-pre-wrap">
                        {ex.output}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

        </div>


        <div className="lg:col-span-8 rounded-2xl overflow-hidden bg-[#1e1e1e] flex flex-col">

          {/* 🛠 EDITOR INSTRUCTION (PURE UI, NO LOGIC) */}
          <div className="px-4 py-3 bg-black/40 border-b border-white/5 text-xs font-mono text-orange-400 tracking-wide">
            🛠 Fix the bug <span className="font-bold">ONLY</span> inside the function below.
            <br />
            {/* 🔥 BLIND MODE UI MSG */}
            <span className="text-gray-500 italic">Results are hidden during exam mode.</span>
          </div>

          <Editor
            height="100%"
            theme="vs-dark"
            language={q.language === "c" ? "cpp" : q.language}
            value={q.code}
            onMount={(editor) => (editorRef.current = editor)}
            onChange={(val) => {
              setQuestions(prev => {
                const c = [...prev];
                c[current].code = val || "";
                return c;
              });
            }}
            options={{
              fontSize: 15,
              lineHeight: 22,
              minimap: { enabled: false },
              wordWrap: "on",
            }}
          />
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex justify-between mt-4">
        <button
          disabled={current === 0}
          onClick={() => setCurrent(c => c - 1)}
          className="px-8 py-3 bg-white/5 rounded-xl font-black disabled:opacity-30"
        >
          PREVIOUS
        </button>

        <button

          onClick={async () => {
            if (saving || submitting) return; // 🔒 HARD GUARD

            // 🔥 LAST QUESTION → ONLY POPUP (NO SAVE & NEXT)
            if (current === questions.length - 1) {
              setPopup({
                show: true,
                type: "submit",
                message:
                  "Are you sure you want to submit your exam? This cannot be undone.",
              });
              return;
            }

            // 🔒 SAVE LOGIC (BLIND - NO VERDICT DISPLAYED)
            setSaving(true);
            try {
              await API.post("/exam/submit-code", {
                userId,
                questionId: q._id,
                code: q.code,
              });
              // Note: Result hum le hi nahi rahe response se user ko dikhane ke liye
              setSaved(true);
            } catch (err) {
              console.error("Save failed");
            }

            setTimeout(() => {
              setSaved(false);
              setCurrent(c => c + 1);
              setSaving(false);
            }, 600);

          }}
          className="px-10 py-3 bg-orange-500 text-black rounded-xl font-black"
        >
          {saving
            ? "SAVING..."
            : saved
              ? "SAVED ✓"
              : current === questions.length - 1
                ? "FINISH"
                : "SAVE & NEXT"}
        </button>

      </div>
    </div>
  );
};

const Center = ({ text, spinner }) => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a0b]">
    {spinner && (
      <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6" />
    )}
    <p className="text-orange-500 font-black uppercase text-xs tracking-widest">
      {text}
    </p>
  </div>
);

export default Exam;