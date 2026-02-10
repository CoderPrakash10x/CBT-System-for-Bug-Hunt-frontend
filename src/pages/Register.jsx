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
  const [showRules, setShowRules] = useState(false); // Rules toggle

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Anti-Cheat & Security Controls
  useEffect(() => {
    if (showRules) {
      // Disable Right Click
      const handleContextMenu = (e) => e.preventDefault();
      // Disable Refresh (F5, Ctrl+R)
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
    }
  }, [showRules]);

  const handleRegister = async () => {
    const { name, email, college, year, language } = form;
    if (!name || !email || !college || !year || !language) {
      return setError("All fields are required");
    }
    setShowRules(true); // Pehle rules dikhayenge
  };

  const startExamFinal = async () => {
    setLoading(true);
    setError("");

    // Request Fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }

    try {
      const res = await registerUser(form);
      localStorage.setItem("userId", res.data.userId);
      // Logic: Refresh hone par wahi se start ho isliye state save kar rahe hain
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white px-4">
      {/* Registration Form */}
      {!showRules ? (
        <div className="w-full max-w-md bg-[#141417] border border-white/5 rounded-[2rem] p-10 shadow-2xl">
          <div className="flex justify-center mb-8">
            <img src={EvolveraLogo} className="h-16 animate-pulse" alt="Logo" />
          </div>

          <h1 className="text-4xl font-black text-center mb-8 tracking-tighter">
            BUG <span className="text-orange-500">HUNT</span>
          </h1>

          <div className="space-y-4">
            <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none transition-all" />
            <input name="email" placeholder="Email" onChange={handleChange} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none transition-all" />
            <input name="college" placeholder="College" onChange={handleChange} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none transition-all" />

            <div className="flex gap-4">
              <select name="year" onChange={handleChange} className="w-1/2 bg-black/50 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none transition-all text-gray-400">
                <option value="">Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              <select name="language" onChange={handleChange} className="w-1/2 bg-black/50 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none transition-all text-gray-400">
                <option value="">Language</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
              </select>
            </div>
          </div>

          <button onClick={handleRegister} className="w-full mt-8 py-4 bg-orange-500 hover:bg-orange-600 text-black rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            CONTINUE
          </button>

          {error && <p className="text-red-500 text-sm text-center mt-4 font-medium italic">!! {error} !!</p>}
        </div>
      ) : (
        /* WAITING PAGE / RULES MODAL */
        <div className="w-full max-w-2xl bg-[#141417] border-2 border-orange-500/30 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(0,0,0,1)]">
          <div className="text-center">
            <h2 className="text-3xl font-black text-orange-500 mb-2">IMPORTANT RULES</h2>
            <p className="text-gray-400 mb-8">Please read carefully before starting the hunt</p>
          </div>

          <div className="space-y-4 mb-10">
            <RuleItem icon="🚫" text="Right-click and Refresh are strictly disabled." />
            <RuleItem icon="🖥️" text="The exam will run in FULLSCREEN mode only." />
            <RuleItem icon="⚠️" text="Switching tabs will trigger a critical warning." />
            <RuleItem icon="⏳" text="Once started, the timer cannot be paused." />
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl mb-8">
            <p className="text-orange-500 text-sm text-center font-bold">
              By clicking "START", you agree to the anti-cheat monitoring.
            </p>
          </div>

          <button 
            onClick={startExamFinal} 
            disabled={loading}
            className="w-full py-5 bg-orange-500 text-black rounded-2xl font-black text-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all"
          >
            {loading ? "INITIALIZING..." : "ENTER FULLSCREEN & START"}
          </button>
        </div>
      )}
    </div>
  );
};

// Sub-component for Rules
const RuleItem = ({ icon, text }) => (
  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
    <span className="text-2xl">{icon}</span>
    <p className="text-gray-200 font-medium">{text}</p>
  </div>
);

export default Register;