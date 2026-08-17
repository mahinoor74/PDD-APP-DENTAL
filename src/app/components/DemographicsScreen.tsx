import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { ChevronRight } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import LanguageSelector from "./LanguageSelector";

export default function DemographicsScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [ageGroup, setAgeGroup] = useState(localStorage.getItem("userAgeGroup") || "");
  const [gender, setGender] = useState(localStorage.getItem("userGender") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (name && ageGroup && gender) {
      setIsSubmitting(true);

      // Save details locally to local storage as fallback cache buffers
      localStorage.setItem("userName", name.trim());
      localStorage.setItem("userAgeGroup", ageGroup);
      localStorage.setItem("userGender", gender);
      
      const activeSessionStr = localStorage.getItem("user_session");
      const activeSession = activeSessionStr ? JSON.parse(activeSessionStr) : null;
      
      // ✅ FIX: Prioritize the live authenticated user ID over a hardcoded default string
      const currentUserId = activeSession?.id || localStorage.getItem("userId") || "1";

      // Secure synchronization back across all layout storage parameters
      localStorage.setItem("userId", currentUserId.toString());

      try {
        // REAL LIVE DATABASE UPDATE SYNC: Pushes profile adjustments directly to port 8000
        const response = await fetch("http://localhost:8000/api/auth/demographics", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: parseInt(currentUserId, 10),
            name: name.trim(),
            ageGroup: ageGroup, 
            gender: gender
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Check if the user came from "Edit Profile Details"
          const isEditing = window.location.search.includes("edit=true");

          if (isEditing) {
            alert("Profile edited successfully! 🎉");
            navigate("/profile"); 
          } else {
            // Navigate with explicit database tracking mode variables
            navigate("/assessment", { state: { mode: data.mode } }); 
          }
        } else {
          alert(data.detail || "Failed to update profile configurations in the database.");
        }
      } catch (error) {
        console.error("Demographics sync runtime crash:", error);
        alert("Backend server connection failed. Moving forward with local storage values.");
        
        const isEditing = window.location.search.includes("edit=true");
        if (isEditing) {
          navigate("/profile");
        } else {
          navigate("/assessment", { state: { mode: ageGroup } });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#2D9CDB]"></div>
            <div className="flex-1 h-1.5 rounded-full bg-gray-200"></div>
            <div className="flex-1 h-1.5 rounded-full bg-gray-200"></div>
          </div>
          <p className="text-xs font-bold text-[#64748B]">{t.step1of3}</p>
        </div>
        <LanguageSelector />
      </div>

      <h1 className="text-3xl font-extrabold text-[#1E293B] mb-2 tracking-tight">
        {t.demographicsTitle}
      </h1>
      <p className="text-[#64748B] mb-8 font-medium text-sm">
        {t.demographicsSubtitle}
      </p>

      <div className="flex-1 space-y-6">
        <div>
          <label className="block text-sm text-[#1E293B] mb-2 font-bold">
            {t.fullNameLabel}
          </label>
          <input
            type="text"
            disabled={isSubmitting}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.fullNamePlaceholder}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#F2F9FF] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB] disabled:opacity-60 text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-sm text-[#1E293B] mb-2 font-bold">
            {t.ageGroupLabel}
          </label>
          <select
            disabled={isSubmitting}
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#F2F9FF] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB] disabled:opacity-60 text-sm font-medium"
          >
            <option value="">{t.selectAgeGroup}</option>
            <option value="child">{t.childMode}</option>
            <option value="teen">{t.teenMode}</option>
            <option value="adult">{t.adultMode}</option>
            <option value="senior">{t.seniorMode}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[#1E293B] mb-3 font-bold">
            {t.genderLabel}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setGender("male")}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer disabled:opacity-60 ${
                gender === "male"
                  ? "bg-[#2D9CDB] text-white shadow-md shadow-[#2D9CDB]/20"
                  : "bg-[#F2F9FF] text-[#1E293B] border border-gray-200 hover:border-sky-300"
              }`}
            >
              {t.male}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setGender("female")}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer disabled:opacity-60 ${
                gender === "female"
                  ? "bg-[#2D9CDB] text-white shadow-md shadow-[#2D9CDB]/20"
                  : "bg-[#F2F9FF] text-[#1E293B] border border-gray-200 hover:border-sky-300"
              }`}
            >
              {t.female}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setGender("other")}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer disabled:opacity-60 ${
                gender === "other"
                  ? "bg-[#2D9CDB] text-white shadow-md shadow-[#2D9CDB]/20"
                  : "bg-[#F2F9FF] text-[#1E293B] border border-gray-200 hover:border-sky-300"
              }`}
            >
              {t.other}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!name || !ageGroup || !gender || isSubmitting}
        className="w-full py-4 rounded-2xl bg-[#0F4C81] text-white font-extrabold hover:bg-[#0F4C81]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 cursor-pointer shadow-md text-sm"
      >
        {isSubmitting ? t.savingProfile : t.continueBtn}
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}