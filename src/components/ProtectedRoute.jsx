import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser, waitForAuth } from "../services/authService";

// ======================================
// Protected Route
// ======================================
// BUG FIX: previously there was no route-level auth guard at all. Every
// page did its own ad-hoc "if no user, just stop loading" check, so an
// unauthenticated visitor hitting /dashboard directly saw a stuck spinner
// or a blank page instead of being sent to Login. This wraps any route
// that requires a signed-in user and redirects to "/" if there isn't one.

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      let user = getCurrentUser();

      if (!user) {
        user = await waitForAuth();
      }

      if (active) {
        setAuthed(!!user);
        setChecking(false);
      }
    };

    check();

    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
      >
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
