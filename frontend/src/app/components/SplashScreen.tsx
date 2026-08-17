import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F9FF] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#2D9CDB] to-[#0F4C81] flex items-center justify-center shadow-lg">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M30 10C20 10 15 15 15 25C15 35 20 40 30 50C40 40 45 35 45 25C45 15 40 10 30 10Z"
                  fill="#2D9CDB"
                />
                <circle cx="25" cy="20" r="3" fill="white" opacity="0.8" />
              </svg>
            </div>
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-[#2D9CDB]" fill="#2D9CDB" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold text-[#1E293B]">ToothMate</h1>
          <p className="text-[#64748B]">Your personal dental guide</p>
        </div>
      </div>

      <div className="absolute bottom-12">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2D9CDB] animate-pulse"></div>
          <div
            className="w-2 h-2 rounded-full bg-[#2D9CDB] animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-[#2D9CDB] animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
