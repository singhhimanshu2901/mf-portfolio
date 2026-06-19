import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRs8h8zSjiBGJjvWx7AzkLSeNioyhLqqY",
  authDomain: "mf-portfolio-ba14e.firebaseapp.com",
  projectId: "mf-portfolio-ba14e",
  storageBucket: "mf-portfolio-ba14e.firebasestorage.app",
  messagingSenderId: "142407151516",
  appId: "1:142407151516:web:4445e9ae3d7b0674b4a259"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;