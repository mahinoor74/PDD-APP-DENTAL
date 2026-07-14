import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { ChevronRight } from "lucide-react";

export default function DemographicsScreen() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-white flex flex-col p-6">
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-1.5 rounded-full bg-[#2D9CDB]"></div>
          <div className="flex-1 h-1.5 rounded-full bg-gray-200"></div>
          <div className="flex-1 h-1.5 rounded-full bg-gray-200"></div>
        </div>
        <p className="text-sm text-[#64748B]">Step 1 of 3</p>
      </div>

      <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
        Tell us about yourself
      </h1>
      <p className="text-[#64748B] mb-8">
        Help us personalize your dental care experience
      </p>

      <div className="flex-1 space-y-6">
        <div>
          <label className="block text-sm text-[#1E293B] mb-2 font-medium">
            Full Name
          </label>
          <input
            type="text"
            disabled={isSubmitting}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3.5 rounded-2xl bg-[#F2F9FF] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB] disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm text-[#1E293B] mb-2 font-medium">
            Age Group
          </label>
          <select
            disabled={isSubmitting}
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#F2F9FF] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB] disabled:opacity-60"
          >
            <option value="">Select age group</option>
            <option value="child">Under 12 (Child Mode)</option>
            <option value="teen">13-17</option>
            <option value="adult">18-59 (Adult Mode)</option>
            <option value="senior">60+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[#1E293B] mb-3 font-medium">
            Gender
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setGender("male")}
              className={`flex-1 py-3.5 rounded-2xl font-medium transition-all cursor-pointer disabled:opacity-60 ${
                gender === "male"
                  ? "bg-[#2D9CDB] text-white"
                  : "bg-[#F2F9FF] text-[#1E293B] border border-gray-200"
              }`}
            >
              Male
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setGender("female")}
              className={`flex-1 py-3.5 rounded-2xl font-medium transition-all cursor-pointer disabled:opacity-60 ${
                gender === "female"
                  ? "bg-[#2D9CDB] text-white"
                  : "bg-[#F2F9FF] text-[#1E293B] border border-gray-200"
              }`}
            >
              Female
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setGender("other")}
              className={`flex-1 py-3.5 rounded-2xl font-medium transition-all cursor-pointer disabled:opacity-60 ${
                gender === "other"
                  ? "bg-[#2D9CDB] text-white"
                  : "bg-[#F2F9FF] text-[#1E293B] border border-gray-200"
              }`}
            >
              Other
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!name || !ageGroup || !gender || isSubmitting}
        className="w-full py-4 rounded-2xl bg-[#0F4C81] text-white font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 cursor-pointer shadow-sm"
      >
        {isSubmitting ? "Saving Profile..." : "Continue"}
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}