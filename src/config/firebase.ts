// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyette7Vchmb56Ag2sKZysQPwAUFGSmDY",
  authDomain: "chat-app-d23be.firebaseapp.com",
  projectId: "chat-app-d23be",
  storageBucket: "chat-app-d23be.firebasestorage.app",
  messagingSenderId: "879609352414",
  appId: "1:879609352414:web:9340007c6c139b821a724f",
  measurementId: "G-9JXE47J24S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth= getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);