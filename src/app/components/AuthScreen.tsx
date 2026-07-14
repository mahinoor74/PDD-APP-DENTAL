import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles } from "lucide-react";

// 🛠️ NETWORK CONTEXT MATRIX: Dynamically routes requests through your active localhost engine host
const API_BASE_URL = "http://localhost:8000/api";

export default function AuthScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    // ACTION A: SUBMIT SIGN UP
    if (mode === "signup") {
      try {
        // 🚀 FIX: Corrected variable call from API_BASE to API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            profile: {
              name,
              ageGroup: "Adult",
              gender: "Not specified"
            }
          }),
        });

        const data = await response.json();
        setIsLoading(false);

        if (!response.ok) {
          setIsError(true);
          setMessage(data.detail || "Sign up failed.");
        } else if (data.success) {
          setIsError(false);
          setMessage(data.message || "Verification email sent! Check your inbox.");
          
          if (data.user && data.user.id) {
            localStorage.setItem("user_session", JSON.stringify(data.user));
            localStorage.setItem("userId", data.user.id.toString());
            localStorage.setItem("userName", data.user.name || name);
          }
          setName("");
          setPassword("");
        }
      } catch (err) {
        setIsLoading(false);
        setIsError(true);
        setMessage("Backend offline. Ensure FastAPI is running on Port 8000!");
      }
    }

    // ACTION B: SUBMIT LOGIN VERIFICATION
    if (mode === "login") {
      try {
        // 🚀 FIX: Corrected variable call from API_BASE to API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setIsLoading(false);
          setIsError(true);
          setMessage(data.detail || "Invalid email or password.");
        } else if (data.success && data.user) {
          // Store both standard string references and dictionary definitions safely
          localStorage.setItem("user_session", JSON.stringify(data.user));
          localStorage.setItem("userId", String(data.user.id));
          localStorage.setItem("userName", String(data.user.name));
          
          setIsLoading(false);
          
          // Route immediately using the completed boarding check flags
          if (data.user.hasCompletedOnboarding === true) {
            navigate("/dashboard");
          } else {
            navigate("/demographics");
          }
        } else {
          setIsLoading(false);
          setIsError(true);
          setMessage("Invalid database payload configuration structure encountered.");
        }
      } catch (err) {
        setIsLoading(false);
        setIsError(true);
        setMessage("Backend unreachable. Ensure server is running with --host 0.0.0.0");
      }
    }

    // ACTION C: PASSWORD RECOVERY DISPATCH
    if (mode === "forgot") {
      try {
        // 🚀 FIX: Corrected variable call from API_BASE to API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/auth/recover`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        const data = await response.json();
        setIsLoading(false);

        if (!response.ok) {
          setIsError(true);
          setMessage(data.detail || "No registered profile matches this email address.");
        } else if (data.success) {
          setIsError(false);
          setMessage("Password recovery request triggered successfully via configuration rules.");
        }
      } catch (err) {
        setIsLoading(false);
        setIsError(true);
        setMessage("Backend offline. Ensure FastAPI is running on Port 8000!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F9FF] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D9CDB] to-[#0F4C81] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-[#1E293B] tracking-tight">ToothMate</h2>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1E293B]">
            {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Recover Account"}
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            {mode === "login" ? "Sign in to continue your dental journey" : mode === "signup" ? "Join ToothMate for secure dental health tracking" : "Get your credentials sent straight to your email"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${
              isError ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
            }`}>
              {isError ? "⚠️ " : "✅ "} {message}
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB]" required />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB]" required />
          </div>

          {mode !== "forgot" && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your account password" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB] pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="flex justify-end">
              <button type="button" onClick={() => { setMode("forgot"); setMessage(""); }} className="text-xs font-bold text-[#2D9CDB] hover:underline cursor-pointer">Forgot Password?</button>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full mt-2 py-4 rounded-2xl bg-[#0F4C81] text-white font-bold hover:bg-[#0F4C81]/90 shadow-md transition-colors disabled:opacity-50 cursor-pointer">
            {isLoading ? "Processing..." : mode === "login" ? "Log In" : mode === "signup" ? "Create Account & Send Mail" : "Send Password to Email"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-[#64748B] uppercase tracking-wider font-bold text-[10px]">Navigation Options</span></div>
          </div>

          <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }} className="w-full py-4 rounded-2xl border-2 border-[#0F4C81] text-[#0F4C81] font-bold hover:bg-[#F2F9FF] transition-colors cursor-pointer">
            {mode === "login" ? "Switch to Create Account View" : "Already have an account? Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}