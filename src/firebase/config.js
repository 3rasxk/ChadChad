import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD_TAS1tvPTHw5khqtSA5hH2MMZziGDiiw",
  authDomain: "chad-chad-f3a73.firebaseapp.com",
  projectId: "chad-chad-f3a73",
  storageBucket: "chad-chad-f3a73.firebasestorage.app",
  messagingSenderId: "100038859212",
  appId: "1:100038859212:web:2fa3bde0f6ba1c9b9b6569",
  measurementId: "G-RS3WTDD3WQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
