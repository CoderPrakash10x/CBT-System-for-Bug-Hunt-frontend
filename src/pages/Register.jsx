import { useState, useEffect } from "react";
import { registerUser } from "../api/auth.api";
import EvolveraLogo from "../assets/evolvera.png";

const Register = () => {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // Anti-Cheat Controls (same logic)
  useEffect(() => {
    if (!showRules) return;

    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.keyCode === 116 || (e.ctrlKey && e.keyCode === 82)) {
        e.preventDefault();
        alert("Refresh is disabled during the exam!");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showRules]);

  const handleRegister = () => {
    const { name, email, college, year, language } = form;
    if (!name || !email || !college || !year || !language) {
      setError("All fields are required");
      return;
    }
    setShowRules(true);
  };

  const startExamFinal = async () => {
    setLoading(true);
    setError("");

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }

    try {
      const res = await registerUser(form);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("examStarted", "true");
      window.location.href = "/exam";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setShowRules(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#09090b] via-[#0b0b0f] to-black text-white px-4">
      {!showRules ? (
        /* ================= REGISTER CARD ================= */
        <div className="w-full max-w-md rounded-[2rem] p-10 bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
          <div className="flex justify-center mb-8">
            <img
              src={EvolveraLogo}
              alt="Evolvera"
              className="h-14 opacity-90"
            />
          </div>

          <h1 className="text-4xl font-black text-center mb-10 tracking-tight">
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
            className="w-full mt-10 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-black font-black text-lg tracking-wide transition-all active:scale-[0.98] shadow-[0_0_25px_rgba(249,115,22,0.35)]"
          >
            CONTINUE
          </button>

          {error && (
            <p className="mt-5 text-center text-red-500 text-sm font-semibold">
              {error}
            </p>
          )}
        </div>
      ) : (
        /* ================= RULES ================= */
        <div className="w-full max-w-2xl rounded-[2.5rem] p-10 bg-[#141417] border border-orange-500/30 shadow-[0_0_80px_rgba(0,0,0,1)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-orange-500">
              IMPORTANT RULES
            </h2>
            <p className="text-gray-400 mt-2">
              Read carefully before entering the exam
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <RuleItem icon="🚫" text="Right-click and Refresh are strictly disabled." />
            <RuleItem icon="🖥️" text="Exam runs in FULLSCREEN mode only." />
            <RuleItem icon="⚠️" text="Tab switching will be monitored." />
            <RuleItem icon="⏳" text="Timer cannot be paused once started." />
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-8">
            <p className="text-orange-400 text-sm text-center font-semibold">
              By clicking START, you agree to anti-cheat monitoring.
            </p>
          </div>

          <button
            onClick={startExamFinal}
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-orange-500 text-black font-black text-xl transition-all hover:shadow-[0_0_35px_rgba(249,115,22,0.45)] disabled:opacity-70"
          >
            {loading ? "INITIALIZING..." : "ENTER FULLSCREEN & START"}
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= UI ATOMS ================= */

const Input = (props) => (
  <input
    {...props}
    className="w-full h-14 px-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-1/2 h-14 px-4 rounded-xl bg-black/50 border border-white/10 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
  >
    {children}
  </select>
);

const RuleItem = ({ icon, text }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
    <span className="text-2xl">{icon}</span>
    <p className="text-gray-200 font-medium">{text}</p>
  </div>
);

export default Register;
