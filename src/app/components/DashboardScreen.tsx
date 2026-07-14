import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Calendar, TrendingUp, User as UserIcon, Award, CheckCircle } from "lucide-react";

// Update this with your exact backend IP address if working on a local network
const API_BASE = "http://10.127.81.158:8000";

export default function DashboardScreen() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId") || "32";
  const currentUserName = localStorage.getItem("userName") || "Mahinoor";

  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/metrics/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) setMetrics(data);
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogBrushingSession = async () => {
    // Front-end safety validation check matching backend business parameters
    if (completedCount >= 2) {
      alert("Daily brushing goals already met. Try tracking tomorrow!");
      return;
    }

    setIsLogging(true);
    try {
      const response = await fetch(`${API_BASE}/api/brush/log-manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: parseInt(currentUserId, 10) 
        }),
      });
      
      const resData = await response.json();

      if (response.ok) {
        alert("Brushing session successfully tracked and logged.");
        await fetchDashboardData();
      } else {
        alert(resData.detail || "Failed to log session.");
      }
    } catch (error) {
      alert("Backend unreachable. Ensure server is running with --host 0.0.0.0");
    } finally {
      setIsLogging(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans font-bold text-[#2D9CDB]">Loading Your Coach...</div>;

  const completedCount = metrics?.todayCompletedCount || 0;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAFC] pb-24 shadow-2xl font-sans flex flex-col box-border overflow-x-hidden">
      
      {/* Top Standings Banner */}
      <div className="w-full bg-[#2D9CDB] text-white p-6 pt-8 pb-8 rounded-b-[2.5rem] relative shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight">{currentUserName}</h2>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center cursor-pointer" onClick={() => navigate("/profile")}>
            <UserIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Circular Progress Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-white/20" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-white transition-all duration-500 ease-out" strokeDasharray={`${(completedCount / 2) * 100}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute font-black text-lg">{completedCount}/2</div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-white/80">Today's Standings</p>
            <h3 className="text-lg font-black mt-0.5">{completedCount} of 2 Brushes Done</h3>
            <p className="text-xs opacity-90 font-medium mt-1">Complete one session to lock in today's goal.</p>
          </div>
        </div>
      </div>

      {/* Main Container Modules */}
      <div className="p-5 space-y-5 flex-1">
        
        {/* Weekly Progress Tracker Card */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100/80">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-extrabold text-sm text-[#1E293B] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2D9CDB]" /> Weekly Progress Tracker
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metrics?.weekRangeLabel || "PROGRESS"}</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName, i) => {
              const dayData = metrics?.weeklyHistory?.[dayName];
              const isDone = dayData?.completed || false;
              const displayNum = dayData?.dayNumber || "";
              const sessionCount = dayData?.count || 0;

              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{dayName}</span>
                  <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-colors relative ${
                    isDone ? "bg-[#2D9CDB]/10 text-[#2D9CDB] border-2 border-[#2D9CDB]" : "bg-slate-50 text-slate-400 border border-slate-100"
                  }`}>
                    <span>{displayNum || dayName[0]}</span>
                    {/* Tiny visual badge counting exact sessions (1 or 2) completed on previous days */}
                    {sessionCount > 0 && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                        {sessionCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak Analytics Block */}
        <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-5 rounded-3xl border border-orange-100/60 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-sm shadow-orange-200">
              <Flame className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{metrics?.streakDays || 0} Days</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Current Unbroken Streak</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs border border-orange-100/50">
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </div>
        </div>

        {/* Two Column Grid Analysis Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2D9CDB] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">{metrics?.totalSessions || 0}</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Total Sessions</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">{metrics?.weeklyCompliancePct || 0}%</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Dynamic Action Process Logging Button */}
        <button 
          onClick={handleLogBrushingSession}
          disabled={isLogging || completedCount >= 2}
          className="w-full mt-2 py-4 bg-[#2D9CDB] text-white rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-blue-100 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {completedCount >= 2 ? "Daily Goal Completed" : isLogging ? "Syncing metrics..." : "Log Brushing Done"}
        </button>

      </div>
    </div>
  );
}