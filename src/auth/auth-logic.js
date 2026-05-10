import { auth, googleProvider, db } from '../firebase/config.js';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Ensure a student document exists in Firestore.
 * Creates one if it doesn't exist yet.
 */
export async function ensureStudentDoc(user) {
  const ref = doc(db, 'students', user.email);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'นักเรียน',
      total_score: 0,
      createdAt: serverTimestamp(),
    });
    console.log('[Auth] ✅ Created new student doc:', user.uid);
  } else {
    console.log('[Auth] 📄 Student doc already exists:', user.uid);
  }
}

/** Sign in with Google popup */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureStudentDoc(result.user);
  return result.user;
}

/** Sign in with Email/Password */
export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await ensureStudentDoc(result.user);
  return result.user;
}

/** Sign out */
export async function logout() {
  await signOut(auth);
}

/** Auth state observer wrapper */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
