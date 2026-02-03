import { useState } from "react";
import { registerUser } from "../api/auth.api";
import EvolveraLogo from "../assets/evolvera.png"; // 👈 logo path adjust if needed

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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white px-4 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[140px]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-400/10 rounded-full blur-[140px]" />

      <div className="relative z-10 w-full max-w-md bg-[#141417]/90 border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        
        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img
            src={EvolveraLogo}
            alt="Evolvera Club"
            className="h-14 opacity-90"
          />
        </div>

        {/* TITLE */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            BUG <span className="text-orange-400">HUNT</span>
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">
            Powered by Evolvera Club
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          {[
            { label: "Full Name", name: "name", placeholder: "John Doe" },
            {
              label: "Email Address",
              name: "email",
              type: "email",
              placeholder: "john@example.com",
            },
            {
              label: "College Name",
              name: "college",
              placeholder: "IIT Bombay",
            },
          ].map((field) => (
            <div key={field.name} className="group">
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 ml-2 mb-1 font-bold group-focus-within:text-orange-400 transition-colors">
                {field.label}
              </label>
              <input
                {...field}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl bg-[#0a0a0c] border border-white/10 
                text-white placeholder:text-gray-600 
                focus:border-orange-400 focus:ring-1 focus:ring-orange-400 
                outline-none transition-all"
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={submit}
          disabled={loading}
          className={`w-full mt-8 py-5 rounded-2xl font-black uppercase tracking-widest transition-all duration-300
            ${
              loading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-orange-400 text-black hover:shadow-[0_0_40px_rgba(251,146,60,0.4)] hover:scale-[1.02] active:scale-95"
            }`}
        >
          {loading ? "Initializing..." : "Enter Arena"}
        </button>

        {/* ERROR */}
        {error && (
          <div className="mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* FOOTER */}
        <p className="mt-10 text-center text-gray-600 text-[10px] uppercase tracking-widest leading-loose">
          Organized by Evolvera Club <br />
          <span className="opacity-70">Designed by Prakash Dubey</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
