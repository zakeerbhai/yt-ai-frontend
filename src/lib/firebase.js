import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v);
if (missing.length) {
  // Fail loudly in dev rather than mysteriously not working.
  console.error(
    `Missing Firebase config: ${missing.map(([k]) => k).join(", ")}. ` +
      "Copy .env.example to .env.local and fill in real values."
  );
}

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
// Force account chooser every time rather than silently reusing the last session.
googleProvider.setCustomParameters({ prompt: "select_account" });
