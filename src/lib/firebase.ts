import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyC6Sr_RjS_WvD1TI1xZ0AYlqTXJBA2WjEQ",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "flutter-ai-playground-214d7.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "flutter-ai-playground-214d7",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "flutter-ai-playground-214d7.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "279724337846",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:279724337846:web:3ed2cb1f865e33cf641417",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-F7BRP3D7LW",
};

// Only initialize if the API key is present
const isFirebaseConfigured = !!(firebaseConfig.apiKey);
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

if (!isFirebaseConfigured) {
  console.warn("Firebase API key is missing. Authentication features will be disabled until configured in the Secrets panel.");
}
