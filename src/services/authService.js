import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { auth, googleProvider } from "../firebase/firebase";

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// ======================================
// Google Sign-In
// ======================================
// Register is now Google-only (per request), which means the ONLY way a
// new account gets created is through this. It's also offered on the
// Login page — otherwise anyone who signed up with Google would have no
// password and could never sign back in.
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// ======================================
// Update Display Name
// ======================================
// Used by the new Settings > Display Name field.
export const updateDisplayName = async (displayName) => {
  if (!auth.currentUser) {
    throw new Error("Not logged in");
  }

  await updateProfile(auth.currentUser, { displayName });

  return auth.currentUser;
};

// ======================================
// Friendlier auth error messages
// ======================================
// Firebase's raw error strings (e.g. "Firebase: Error (auth/wrong-password).")
// aren't great to show directly in an alert(). This maps the common ones.
export const getAuthErrorMessage = (error) => {
  const code = error?.code || "";

  const messages = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Please check your connection."
  };

  return messages[code] || error?.message || "Something went wrong. Please try again.";
};
