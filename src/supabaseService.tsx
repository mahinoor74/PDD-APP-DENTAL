import { supabase } from "./supabaseClient";

export const signUpUser = async (email, password, profileData) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth', 
      }
    });

    if (authError) throw authError;

    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name: profileData.name || 'User',
            age_group: profileData.ageGroup || 'Adult',
            gender: profileData.gender || 'Not specified',
            language: profileData.language || 'English',
            current_mode: profileData.currentMode || 'adult',
            prescribed_technique: null,
          },
        ]);

      if (profileError) throw profileError;
    }

    return { user: authData.user, error: null };
  } catch (error: any) {
    console.error('Error in signUpUser:', error.message);
    return { user: null, error: error.message };
  }
};

export const signInUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error in signInUser:', error.message);
    return { user: null, error: error.message };
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error sending reset email:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateNewPassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating password:', error.message);
    return { success: false, error: error.message };
  }
};