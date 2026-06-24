import { Link, useNavigate } from "react-router-dom";
import {
  Film,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function Register() {
  const navigate = useNavigate();

  // Registration states block matrices
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useDocumentTitle("Register");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 🌟 FRONTEND DATA VALIDATION CHECKS
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All security parameter registration fields are required.");
      return;
    }
    if (formData.username.trim().length < 3) {
      setError("Username profile parameters must exceed 3 letters.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Security passwords must be at least 8 alphanumeric blocks.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Confirmation password configuration mismatch.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulate background registration server upload pipeline latency
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("📝 Account Pipeline Initialized:", formData.username);

      // Save dummy credential cookies token to simulate completed initialization loops
      localStorage.setItem("cinemi_token", "mock-v8-isolate-session-jwt-key");
      localStorage.setItem(
        "cinemi_user",
        JSON.stringify({ email: formData.email, username: formData.username }),
      );

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        "Registration server timed out. Please try a different email registry.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 relative font-[Inter] overflow-hidden select-none">
      {/* Background ambient lighting glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#b11226]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#b11226]/5 blur-[120px] pointer-events-none" />

      {/* Main card box frame layout container */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-md relative z-10 flex flex-col gap-5 animate-[fade-in_0.3s_ease-out]">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="w-11 h-11 rounded-xl bg-(--primary-color) text-white flex items-center justify-center shadow-lg shadow-[#b11226]/20">
            <Film size={22} fill="currentColor" />
          </div>
          <h1 className="text-[24px] font-black text-white tracking-tight uppercase mt-2">
            Join Cinemi
          </h1>
          <p className="text-[13px] text-[#a1a1a1] font-medium">
            Create an account to track watchlists and unlock analytics
          </p>
        </div>

        {error && (
          <div className="bg-[#b11226]/10 border border-[#b11226]/20 rounded-xl p-3 flex gap-2.5 items-center text-[#ff4d5a] text-[13px] font-medium animate-[slide-down_0.2s_ease-out]">
            <AlertCircle size={16} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-3.5 text-[14px]"
        >
          {/* Username Field */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="username"
              className="text-white/70 font-semibold text-[13px]"
            >
              Display Username
            </label>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 focus-within:border-(--primary-color)/50 rounded-xl px-3.5 py-2.5 transition-colors">
              <User size={16} className="text-white/30" />
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="AnimeFan42"
                className="w-full bg-transparent text-white outline-none placeholder-white/20 font-medium"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-white/70 font-semibold text-[13px]"
            >
              Email Address
            </label>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 focus-within:border-(--primary-color)/50 rounded-xl px-3.5 py-2.5 transition-colors">
              <Mail size={16} className="text-white/30" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className="w-full bg-transparent text-white outline-none placeholder-white/20 font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-white/70 font-semibold text-[13px]"
            >
              Choose Password
            </label>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 focus-within:border-(--primary-color)/50 rounded-xl px-3.5 py-2.5 transition-colors">
              <Lock size={16} className="text-white/30" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Min 8 characters"
                className="w-full bg-transparent text-white outline-none placeholder-white/20 font-medium font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirmPassword"
              className="text-white/70 font-semibold text-[13px]"
            >
              Confirm Password
            </label>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 focus-within:border-(--primary-color)/50 rounded-xl px-3.5 py-2.5 transition-colors">
              <Lock size={16} className="text-white/30" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repeat password"
                className="w-full bg-transparent text-white outline-none placeholder-white/20 font-medium font-mono"
              />
            </div>
          </div>

          {/* Submit Registry Action Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-(--primary-color) hover:bg-[#b11226] text-white font-bold text-[14px] uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg shadow-red-950/20 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Free Account</span>
                <CheckCircle2 size={15} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[13px] text-[#a1a1a1] font-medium border-t border-white/5 pt-4 mt-0.5">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-(--brand-color) font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
