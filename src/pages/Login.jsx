import { useState } from "react";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("Couldn't sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--color-ink)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-signal)" }} aria-hidden="true" />
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--color-stone)" }}>
            Pipeline
          </span>
        </div>

        <h1
          className="text-3xl text-center mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}
        >
          Upload once.
          <br />
          The pipeline does the rest.
        </h1>
        <p className="text-sm text-center mb-10" style={{ color: "var(--color-stone)" }}>
          Transcript, title, description, tags, and scheduling — generated automatically,
          reviewed by you before anything goes live.
        </p>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-opacity disabled:opacity-60"
          style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
        >
          <GoogleIcon />
          {loading ? "Signing in…" : "Continue with Google"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-center" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        <p className="mt-8 text-xs text-center" style={{ color: "var(--color-stone)" }}>
          You'll connect a YouTube channel after signing in.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.87-3.04.87-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
