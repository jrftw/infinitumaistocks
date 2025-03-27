// MARK: Firebase Setup - firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBk6MuRoVhEQ5Zv2YXGlIZP5TNDKM1E93Q",
  authDomain: "infinitumaistocks.firebaseapp.com",
  projectId: "infinitumaistocks",
  storageBucket: "infinitumaistocks.firebasestorage.app",
  messagingSenderId: "1060979787449",
  appId: "1:1060979787449:web:d2055f47309b75ed7cfd68",
  measurementId: "G-J4T09S0PGD",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export these
export const auth = getAuth(app);
export const db = getFirestore(app); // 👈 This is what was missing

const analytics = getAnalytics(app);
