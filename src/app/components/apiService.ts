// Automatic PC Local Wi-Fi IP detected from Windows ipconfig
export const DETECTED_PC_IP = "10.179.103.56";

export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const origin = window.location.origin;

    // 1. Capacitor Android Native App
    if (protocol === "capacitor:" || protocol === "file:" || (typeof (window as any).Capacitor !== "undefined")) {
      const savedIp = localStorage.getItem("custom_backend_ip");
      if (savedIp) {
        const cleanIp = savedIp.trim().replace(/^https?:\/\//, "").replace(/\/api\/?$/, "").replace(/\/$/, "");
        // If saved IP has no port specified, default to 8000
        const formattedHost = cleanIp.includes(":") ? cleanIp : `${cleanIp}:8000`;
        return `http://${formattedHost}/api`;
      }
      return `http://${DETECTED_PC_IP}:8000/api`;
    }

    // 2. Web & Mobile Browser (Uses Vite Dev Proxy or explicit IP)
    if (protocol === "http:" || protocol === "https:") {
      const savedIp = localStorage.getItem("custom_backend_ip");
      if (savedIp) {
        const cleanIp = savedIp.trim().replace(/^https?:\/\//, "").replace(/\/api\/?$/, "").replace(/\/$/, "");
        const formattedHost = cleanIp.includes(":") ? cleanIp : `${cleanIp}:8000`;
        return `http://${formattedHost}/api`;
      }
      // If hosted on localhost browser, fall back to detected IP if origin proxy isn't set
      return `${origin}/api`;
    }
  }

  return `http://${DETECTED_PC_IP}:8000/api`;
};

export let API_BASE_URL = getApiBaseUrl();

export const setCustomBackendIp = (ip: string) => {
  if (ip && ip.trim()) {
    const cleanIp = ip.trim().replace(/^https?:\/\//, "").replace(/\/api\/?$/, "").replace(/\/$/, "");
    localStorage.setItem("custom_backend_ip", cleanIp);
    API_BASE_URL = `http://${cleanIp.includes(":") ? cleanIp : `${cleanIp}:8000`}/api`;
  } else {
    localStorage.removeItem("custom_backend_ip");
    API_BASE_URL = getApiBaseUrl();
  }
};

// Resilient Fetcher with Automatic Fallback for Mobile Devices & Emulators
export const fetchApiResilient = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const primaryUrl = `${getApiBaseUrl()}${endpoint}`;

  try {
    const res = await fetch(primaryUrl, options);
    return res;
  } catch (primaryErr) {
    console.warn(`Primary fetch to ${primaryUrl} failed. Attempting fallback backend routes...`);

    // Candidate fallbacks in priority order
    const candidateBases: string[] = [];

    candidateBases.push(`http://${DETECTED_PC_IP}:8000/api`);
    if (typeof window !== "undefined" && window.location.origin) {
      candidateBases.push(`${window.location.origin}/api`);
    }
    candidateBases.push("http://10.0.2.2:8000/api");
    candidateBases.push("http://127.0.0.1:8000/api");
    candidateBases.push("http://localhost:8000/api");

    for (const base of candidateBases) {
      if (`${base}${endpoint}` === primaryUrl) continue;
      try {
        const fallbackRes = await fetch(`${base}${endpoint}`, options);
        if (fallbackRes.ok || fallbackRes.status < 500) {
          console.log(`✅ Fallback connection succeeded with: ${base}`);
          API_BASE_URL = base;
          return fallbackRes;
        }
      } catch (err) {
        // Continue trying next candidate
      }
    }

    throw primaryErr;
  }
};

// 🔐 1. SIGN UP ACTION HANDLER
export const signUpUserLocal = async (email: string, password_raw: string, profileData: any) => {
  try {
    const response = await fetchApiResilient(`/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password_raw,
        profile: {
          name: profileData.name,
          ageGroup: profileData.ageGroup,
          gender: profileData.gender
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Registration processing failed");

    return { success: true, data, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
};

// 🔑 2. SIGN IN ACTION HANDLER
export const signInUserLocal = async (email: string, password_raw: string) => {
  try {
    const response = await fetchApiResilient(`/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password_raw }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Authentication entry failed");

    return { success: true, user: data.user, error: null };
  } catch (error: any) {
    return { success: false, user: null, error: error.message };
  }
};

// 📧 3. FORGOT PASSWORD ACTION HANDLER
export const forgotPasswordEmailLocal = async (email: string) => {
  try {
    const response = await fetchApiResilient(`/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Reset query failed");
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};