import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { registerServiceWorkerReminders } from "./app/components/useReminders";

// Register background Service Worker for OS-level alarms when tab/app is closed
registerServiceWorkerReminders();

// This forces the app to capture keyboard focus so arrow keys work
window.addEventListener("click", () => {
  const scrollContainer = document.querySelector(".overflow-y-auto");
  if (scrollContainer) (scrollContainer as HTMLElement).focus();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);