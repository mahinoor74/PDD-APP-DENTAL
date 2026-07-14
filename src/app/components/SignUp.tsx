import React from "react";
import { Navigate } from "react-router-dom";

export default function SignUp() {
  // ✅ Redirects safely back to your unified single-card authentication interface
  return <Navigate to="/auth" replace />;
}