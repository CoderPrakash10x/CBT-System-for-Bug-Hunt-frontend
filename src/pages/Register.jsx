import { useState } from "react";
import { registerUser } from "../api/auth.api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.college) {
        return setError("All fields are required!");
    }
    
    setError("");
    setLoading(true);

    try {
      const res = await registerUser(form);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("examFlow", "waiting");
      window.location.href = "/exam";
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[120px]"></div>

      <div className="bg-[#141417] border border-white/5 p-8 md:p-10 rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 backdrop-blur-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2">
            BUG <span className="text-primary underline decoration-2 underline-offset-4">HUNT</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.2em]">Enter the Arena</p>
        </div>

        <div className="space-y-4">
          <div className="group">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-2 mb-1 block font-bold group-focus-within:text-primary transition-colors">Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              className="w-full p-4 bg-[#0a0a0c] border border-white/5 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-700"
              onChange={handleChange}
            />
          </div>

          <div className="group">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-2 mb-1 block font-bold group-focus-within:text-primary transition-colors">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="john@example.com"
              className="w-full p-4 bg-[#0a0a0c] border border-white/5 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-700"
              onChange={handleChange}
            />
          </div>

          <div className="group">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-2 mb-1 block font-bold group-focus-within:text-primary transition-colors">College Name</label>
            <input
              name="college"
              placeholder="IIT Bombay"
              className="w-full p-4 bg-[#0a0a0c] border border-white/5 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-700"
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className={`
            w-full py-5 mt-8 rounded-2xl font-black uppercase tracking-widest transition-all duration-300
            ${
              loading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-primary text-black hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-95"
            }
          `}
        >
          {loading ? "Initializing..." : "Register Now"}
        </button>

        {error && (
          <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center font-bold animate-shake">
            ⚠️ {error}
          </div>
        )}

        <p className="mt-8 text-center text-gray-600 text-[10px] uppercase tracking-widest leading-loose">
          By joining, you agree to the <br /> code of conduct and event rules.
        </p>
      </div>
    </div>
  );
};

export default Register;