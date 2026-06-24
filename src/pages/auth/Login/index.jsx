import { Link, useNavigate } from "react-router-dom";
import {
  Film,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function Login() {
  const navigate = useNavigate();

  // Form State Matrices
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useDocumentTitle("Log In");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all security parameter credentials.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulate authentication request pipeline latency (Replace with your live login API fetch)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      console.log("🔐 Cinemi Session Initialized Safely:", formData.email);

      // Mock session token cookie storage update execution loop
      localStorage.setItem("cinemi_token", "mock-v8-isolate-session-jwt-key");
      localStorage.setItem(
        "cinemi_user",
        JSON.stringify({ email: formData.email, username: "OtakuViewer" }),
      );

      navigate("/", { replace: true }); // Forward safely back home
    } catch (err) {
      setError("Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 relative font-[Inter] overflow-hidden select-none">
      {/* Absolute Background Cinematic Ambient Radial Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#b11226]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#b11226]/5 blur-[120px] pointer-events-none" />

      {/* Main Authentication Card Box */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-md relative z-10 flex flex-col gap-6 animate-[fade-in_0.3s_ease-out]">
        {/* Platform Identity Branding Branding */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="w-12 h-12 rounded-xl bg-(--primary-color) text-white flex items-center justify-center shadow-lg shadow-[#b11226]/20">
            <Film size={24} fill="currentColor" />
          </div>
          <h1 className="text-[24px] font-black text-white tracking-tight uppercase mt-2">
            Welcome Back
          </h1>
          <p className="text-[13px] text-[#a1a1a1] font-medium">
            Log in to continue tracking your favorite anime series
          </p>
        </div>

        {/* Localized Form Error Toast */}
        {error && (
          <div className="bg-[#b11226]/10 border border-[#b11226]/20 rounded-xl p-3.5 flex gap-2.5 items-center text-[#ff4d5a] text-[13px] font-medium animate-[slide-down_0.2s_ease-out]">
            <AlertCircle size={16} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Input Interactive Forms Stack */}
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-4 text-[14px]"
        >
          {/* Email input line */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-white/70 font-semibold text-[13px]"
            >
              Email Address
            </label>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 focus-within:border-(--primary-color)/50 rounded-xl px-3.5 py-3 transition-colors">
              <Mail size={16} className="text-white/30" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className="w-full bg-transparent text-white outline-none placeholder-white/20 font-medium"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password input line with Toggle switch eyes options */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-white/70 font-semibold text-[13px]"
              >
                Security Password
              </label>
              <Link
                to="/forgot-password"
                className="text-(--brand-color) font-bold text-[12px] hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 focus-within:border-(--primary-color)/50 rounded-xl px-3.5 py-3 transition-colors">
              <Lock size={16} className="text-white/30" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full bg-transparent text-white outline-none placeholder-white/20 font-medium font-mono"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Action Button Core */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-(--primary-color) hover:bg-[#b11226] text-white font-bold text-[14px] uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg shadow-red-950/20 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Redirect Route Footer block Link */}
        <div className="text-center text-[13px] text-[#a1a1a1] font-medium border-t border-white/5 pt-4 mt-1">
          <p>
            New to the platform?{" "}
            <Link
              to="/register"
              className="text-(--brand-color) font-bold hover:underline"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
