import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously as fbSignInAnonymously, linkWithPopup, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCS6Mykczen76pfro5mKs0x4MtYNEtdHvM",
  authDomain: "one-at-a-time-a0743.firebaseapp.com",
  projectId: "one-at-a-time-a0743",
  storageBucket: "one-at-a-time-a0743.firebasestorage.app",
  messagingSenderId: "686928944589",
  appId: "1:686928944589:web:eebaf19eae02ddc1347884",
  measurementId: "G-05V9ZP28T5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch(() => {});

const googleProvider = new GoogleAuthProvider();

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function switchAccount() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}

export function signInAnonymously() {
  return fbSignInAnonymously(auth);
}

export function linkAnonymousToGoogle() {
  const provider = new GoogleAuthProvider();
  return linkWithPopup(auth.currentUser, provider);
}

export function signOut() {
  return fbSignOut(auth);
}

export function getUid() {
  return auth.currentUser?.uid;
}

export { db, auth };
