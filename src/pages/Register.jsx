import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithGoogle,
  getAuthErrorMessage,
  getCurrentUser,
  waitForAuth
} from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let user = getCurrentUser();
      if (!user) user = await waitForAuth();
      if (user) navigate("/dashboard");
    })();
  }, [navigate]);

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      alert(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "#0A0F1E",
        color: "#F3EFE4",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <style>{`
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-block mb-8 text-sm text-[#9AA3C0] hover:text-[#F3EFE4] transition-colors"
        >
          ← MF Portfolio
        </Link>

        <div
          className="w-full rounded-2xl p-8 border"
          style={{ background: "#121A30", borderColor: "#1C2440" }}
        >
          <h1 className="font-display text-3xl mb-2">Create an account</h1>
          <p className="text-[#9AA3C0] mb-8">
            Sign up with Google to start tracking your investments.
          </p>

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-semibold border transition-colors disabled:opacity-60 hover:bg-[#0A0F1E]"
            style={{ background: "#0A0F1E", borderColor: "#1C2440" }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.3 10.4z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.4-2 14.1-5.4l-6.5-5.5C29.6 34.9 27 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.9 39.7 16.4 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.2 5.7l6.5 5.5C39.9 36.6 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
            {loading ? "Signing up..." : "Continue with Google"}
          </button>

          <p className="mt-8 text-center text-[#9AA3C0]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#E8CE8B] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
