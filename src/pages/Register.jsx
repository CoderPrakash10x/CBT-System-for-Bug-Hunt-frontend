import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import EvolveraLogo from "../assets/evolvera.png";

const Register = ({ updateSession }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    year: "",
    language: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  /* ================= SECURITY (RULES SCREEN ONLY) ================= */
  useEffect(() => {
    if (!showRules) return;

    const disableContext = (e) => e.preventDefault();
    const disableRefresh = (e) => {
      if (e.keyCode === 116 || (e.ctrlKey && e.keyCode === 82)) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableContext);
    document.addEventListener("keydown", disableRefresh);

    return () => {
      document.removeEventListener("contextmenu", disableContext);
      document.removeEventListener("keydown", disableRefresh);
    };
  }, [showRules]);

  /* ================= VALIDATE FORM ================= */
  const handleRegister = () => {
    const { name, email, college, year, language } = form;
    if (!name || !email || !college || !year || !language) {
      setError("All fields are required");
      return;
    }
    setShowRules(true);
  };

  /* ================= FINAL START ================= */
  const startExamFinal = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await registerUser(form);

      // ✅ SAFE CLEANUP (NO OVER-PROTECTION)
      localStorage.removeItem("userId");
      localStorage.removeItem("examStarted");
      localStorage.removeItem("examFinished");
      localStorage.removeItem("disqualified");

      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("examStarted", "true");

      updateSession?.();

      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen().catch(() => {});
      }

      navigate("/exam", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setShowRules(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_65%)] pointer-events-none" />

      {!showRules ? (
        <div className="relative w-full max-w-md rounded-[2rem] p-[1px] bg-orange-500/40 shadow-[0_0_80px_rgba(249,115,22,0.45)]">
          <div className="rounded-[1.9rem] p-10 bg-[#0b0b0b]/95 backdrop-blur-xl border border-orange-500/20">
            <div className="flex justify-center mb-8">
              <img src={EvolveraLogo} alt="Evolvera" className="h-14" />
            </div>

            <h1 className="text-4xl font-extrabold text-center mb-10 tracking-tight">
              BUG <span className="text-orange-500">HUNT</span>
            </h1>

            <div className="space-y-4">
              <Input name="name" placeholder="Full Name" onChange={handleChange} />
              <Input name="email" placeholder="Email Address" onChange={handleChange} />
              <Input name="college" placeholder="College / University" onChange={handleChange} />

              <div className="flex gap-4">
                <Select name="year" onChange={handleChange}>
                  <option value="">Academic Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </Select>

                <Select name="language" onChange={handleChange}>
                  <option value="">Language</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                </Select>
              </div>
            </div>

            <button
              onClick={handleRegister}
              className="w-full mt-10 py-4 rounded-xl bg-orange-500 text-black font-extrabold text-lg tracking-wide transition-all hover:bg-orange-400 active:scale-[0.97]"
            >
              CONTINUE
            </button>

            {error && (
              <p className="mt-5 text-center text-red-500 text-sm font-semibold">
                {error}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl rounded-[2rem] p-10 bg-[#0b0b0b] border border-orange-500/25 shadow-[0_0_80px_rgba(0,0,0,1)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-orange-500">
              IMPORTANT RULES
            </h2>
            <p className="text-gray-400 mt-2">
              Read carefully before entering the exam
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <RuleItem icon="🚫" text="Right-click and refresh are disabled." />
            <RuleItem icon="🖥️" text="Exam runs strictly in fullscreen mode." />
            <RuleItem icon="⚠️" text="Tab switching is monitored continuously." />
            <RuleItem icon="⏳" text="Timer cannot be paused once started." />
          </div>

          <button
            onClick={startExamFinal}
            disabled={loading}
            className="w-full py-5 rounded-xl bg-orange-500 text-black font-black text-xl transition-all hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] disabled:opacity-70"
          >
            {loading ? "INITIALIZING..." : "ENTER FULLSCREEN & START"}
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const Input = (props) => (
  <input
    {...props}
    autoComplete="off"
    className="w-full h-14 px-4 rounded-xl bg-[#0f0f0f] border border-orange-500/20 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-1/2 h-14 px-4 rounded-xl bg-[#0f0f0f] border border-orange-500/20 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all cursor-pointer"
  >
    {children}
  </select>
);

const RuleItem = ({ icon, text }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0f0f] border border-orange-500/20">
    <span className="text-2xl">{icon}</span>
    <p className="text-gray-200 font-medium">{text}</p>
  </div>
);

export default Register;
