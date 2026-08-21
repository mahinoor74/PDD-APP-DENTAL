import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, ShieldCheck, Camera, MessageSquare, Bell, ArrowRight, User, Mail, Lock, Server } from "lucide-react";
import { API_BASE_URL, fetchApiResilient, setCustomBackendIp, DETECTED_PC_IP } from "./apiService";

export default function AuthScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      if (modeParam === "login" || modeParam === "forgot") return modeParam;
    }
    return "signup";
  });
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("smahinoor376@gmail.com");
  const [password, setPassword] = useState("1234567");
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Server IP Override toggle for mobile phone network connections
  const [showIpConfig, setShowIpConfig] = useState(false);
  const [customIpInput, setCustomIpInput] = useState(() => localStorage.getItem("custom_backend_ip") || DETECTED_PC_IP);

  const handleSaveCustomIp = () => {
    setCustomBackendIp(customIpInput);
    setShowIpConfig(false);
    setIsError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    // ACTION A: SUBMIT SIGN UP
    if (mode === "signup") {
      try {
        const response = await fetchApiResilient(`/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            profile: {
              name: name.trim() || "User",
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
          setMessage("Account registered successfully! Redirecting to setup...");
          
          if (data.user && data.user.id) {
            localStorage.setItem("user_session", JSON.stringify(data.user));
            localStorage.setItem("userId", data.user.id.toString());
            localStorage.setItem("userName", data.user.name || name);
          } else {
            localStorage.setItem("userName", name.trim() || "User");
          }
          setTimeout(() => {
            navigate("/demographics");
          }, 600);
        }
      } catch (err: any) {
        setIsLoading(false);
        setIsError(true);
        setMessage("Unable to reach backend server. Ensure Uvicorn is running on Port 8000. On physical phones, turn off 5G Mobile Data to use Wi-Fi, or tap 'Set IP'.");
      }
    }

    // ACTION B: SUBMIT LOGIN VERIFICATION
    if (mode === "login") {
      try {
        const response = await fetchApiResilient(`/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setIsLoading(false);
          setIsError(true);
          setMessage(data.detail || "Invalid email or password.");
        } else if (data.success && data.user) {
          localStorage.setItem("user_session", JSON.stringify(data.user));
          localStorage.setItem("userId", String(data.user.id));
          localStorage.setItem("userName", String(data.user.name));
          localStorage.setItem("userEmail", String(data.user.email));
          
          setIsLoading(false);
          
          if (data.user.hasCompletedOnboarding === true) {
            navigate("/dashboard");
          } else {
            navigate("/demographics");
          }
        } else {
          setIsLoading(false);
          setIsError(true);
          setMessage("Invalid response payload structure from server.");
        }
      } catch (err: any) {
        setIsLoading(false);
        setIsError(true);
        setMessage("Unable to reach backend server. Ensure Uvicorn is running on Port 8000. On physical phones, turn off 5G Mobile Data to use Wi-Fi, or tap 'Set IP'.");
      }
    }

    // ACTION C: PASSWORD RECOVERY DISPATCH
    if (mode === "forgot") {
      try {
        const response = await fetchApiResilient(`/auth/recover`, {
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
          setMessage("Password recovery email dispatched successfully.");
        }
      } catch (err: any) {
        setIsLoading(false);
        setIsError(true);
        setMessage("Unable to reach backend server. Ensure Uvicorn is running on Port 8000.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans antialiased text-slate-800">
      
      {/* Split-Screen Main Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        
        {/* Left Column (Hero Showcase) */}
        <div className="hidden md:flex md:col-span-6 gradient-dental text-white p-8 md:p-10 flex-col justify-between relative overflow-hidden">
          {/* Ambient Glow Effects */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Logo & Tagline Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
                <Sparkles className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">ToothMate</h1>
                <p className="text-xs text-cyan-200 font-semibold tracking-wider uppercase">AI Dental Health Coach</p>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-white mt-4">
              Your Personal AI Assistant for Perfect Oral Hygiene.
            </h2>
            <p className="text-sm text-sky-100/90 font-medium mt-3 leading-relaxed">
              Track daily brushing habits, receive personalized clinical technique guides, and consult with Dr. Minty AI assistant anytime.
            </p>
          </div>

          {/* Feature Badges Grid */}
          <div className="relative z-10 space-y-3.5 my-8">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-cyan-400/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Dr. Minty AI Assistant</h4>
                <p className="text-[11px] text-sky-100/80">Real-time dental advice & recommendations</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-teal-400/20 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Smart Mirror Coach</h4>
                <p className="text-[11px] text-sky-100/80">Guided 2-minute camera technique timer</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Scheduled Hygiene Alarms</h4>
                <p className="text-[11px] text-sky-100/80">Morning & night reminder notifications</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 flex items-center justify-between text-xs text-sky-200/90 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Encrypted Account Security & Private Storage</span>
            </div>
          </div>
        </div>

        {/* Right Column (Form Console) */}
        <div className="col-span-12 md:col-span-6 p-6 sm:p-10 flex flex-col justify-center bg-white relative">
          
          {/* Top Right Mobile Server IP Button */}
          <button 
            type="button"
            onClick={() => setShowIpConfig(!showIpConfig)}
            className="absolute top-6 right-6 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Configure PC Server IP for Mobile"
          >
            <Server className="w-3.5 h-3.5 text-sky-600" />
            <span>Server IP</span>
          </button>

          {/* Collapsible Mobile Server IP Config Box */}
          {showIpConfig && (
            <div className="mb-6 p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-sky-900 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-sky-600" /> PC Server IP Config (Mobile Phone)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                If running on a physical phone via Wi-Fi, enter your PC's Local IP address (e.g. <code>10.179.103.56</code>):
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customIpInput} 
                  onChange={(e) => setCustomIpInput(e.target.value)} 
                  placeholder="e.g. 10.179.103.56" 
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono outline-none"
                />
                <button 
                  type="button" 
                  onClick={handleSaveCustomIp} 
                  className="px-3 py-2 bg-sky-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-sky-500 cursor-pointer"
                >
                  Save IP
                </button>
              </div>
            </div>
          )}

          {/* Header Mobile Brand & Mode Switcher */}
          <div className="mb-6 text-center md:text-left">
            <div className="md:hidden flex items-center gap-2.5 justify-center mb-4">
              <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">ToothMate</h2>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Your Account" : "Recover Credentials"}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {mode === "login" 
                ? "Sign in to access your dashboard and daily habit logs." 
                : mode === "signup" 
                ? "Join ToothMate for clinical technique tracking and AI care." 
                : "Enter your registered email to receive password recovery steps."}
            </p>
          </div>

          {/* Tab Selection Switches */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setMode("login"); setMessage(""); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === "login" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setMessage(""); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === "signup" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              New Account
            </button>
          </div>

          {/* Form Controls */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Status Toast Banner */}
            {message && (
              <div className={`p-4 rounded-2xl text-xs font-bold border transition-all ${
                isError 
                  ? "bg-rose-50 border-rose-200/80 text-rose-700" 
                  : "bg-emerald-50 border-emerald-200/80 text-emerald-700"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <span>{isError ? "⚠️ " : "✅ "} {message}</span>
                  {isError && (
                    <button 
                      type="button" 
                      onClick={() => setShowIpConfig(true)} 
                      className="underline text-[11px] font-black text-rose-800 shrink-0"
                    >
                      Set IP
                    </button>
                  )}
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Mahinoor" 
                    className="w-full pl-11 pr-4 py-3.5 min-h-[48px] rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all" 
                    required 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="smahinoor376@gmail.com" 
                  className="w-full pl-11 pr-4 py-3.5 min-h-[48px] rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all" 
                  required 
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
                  {mode === "login" && (
                    <button 
                      type="button" 
                      onClick={() => { setMode("forgot"); setMessage(""); }} 
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer min-h-[40px] px-2 flex items-center"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••••••" 
                    className="w-full pl-11 pr-12 py-3.5 min-h-[48px] rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all" 
                    required 
                  />
                  <button 
                    type="button" 
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((prev) => !prev)} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-20"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 py-4 min-h-[48px] rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm tracking-wide shadow-md shadow-teal-600/15 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                {isLoading 
                  ? "Verifying Account..." 
                  : mode === "login" 
                  ? "Log In to ToothMate" 
                  : mode === "signup" 
                  ? "Create Account" 
                  : "Dispatch Recovery Email"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
