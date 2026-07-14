const API_BASE_URL = "http://localhost:8000/api";

// 🔐 1. SIGN UP ACTION HANDLER
export const signUpUserLocal = async (email: string, password_raw: string, profileData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
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

// 🔑 2. SIGN IN ACTION HANDLER (Fixed the missing export error!)
export const signInUserLocal = async (email: string, password_raw: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
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