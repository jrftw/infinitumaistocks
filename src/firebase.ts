// MARK: Firebase Setup - src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, setDoc, doc, getDoc } from "firebase/firestore";

// ✅ Firebase config
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

// ✅ Services
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);

// MARK: Firestore Portfolio Logic
export type PortfolioItem = {
  symbol: string;
  quantity: number;
  costBasis: number;
};

const HARDCODED_USER_ID = "test_user_001";

export async function savePortfolio(data: PortfolioItem[]) {
  const ref = doc(collection(db, "portfolios"), HARDCODED_USER_ID);
  await setDoc(ref, { data });
}

export async function loadPortfolio(): Promise<PortfolioItem[]> {
  const ref = doc(collection(db, "portfolios"), HARDCODED_USER_ID);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    return snapshot.data().data as PortfolioItem[];
  }
  return [];
}
