import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Hiding API secrets by using environment variables as primary source.
// Fallback to local config file if env vars are missing (standard AI Studio behavior).
import localConfig from '../firebase-applet-config.json';

// Static helper to check for placeholder values
const isNotPlaceholder = (val: string | undefined) => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length < 8) return false;
  
  const placeholders = [
    'MY_FIREBASE_API_KEY',
    'MY_FIREBASE_AUTH_DOMAIN',
    'MY_FIREBASE_PROJECT_ID',
    'MY_FIREBASE_STORAGE_BUCKET',
    'MY_SENDER_ID',
    'MY_APP_ID',
    'MY_DATABASE_ID',
    'NOT_SET',
    'undefined',
    'null'
  ];
  return !placeholders.includes(trimmed) && !trimmed.includes('NOT_SET');
};

const firebaseConfig = {
  apiKey: isNotPlaceholder(import.meta.env.VITE_FIREBASE_API_KEY) 
    ? (import.meta.env.VITE_FIREBASE_API_KEY as string) 
    : localConfig.apiKey,
  authDomain: isNotPlaceholder(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
    ? (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) 
    : localConfig.authDomain,
  projectId: isNotPlaceholder(import.meta.env.VITE_FIREBASE_PROJECT_ID)
    ? (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) 
    : localConfig.projectId,
  storageBucket: isNotPlaceholder(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)
    ? (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) 
    : localConfig.storageBucket,
  messagingSenderId: isNotPlaceholder(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID)
    ? (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) 
    : localConfig.messagingSenderId,
  appId: isNotPlaceholder(import.meta.env.VITE_FIREBASE_APP_ID)
    ? (import.meta.env.VITE_FIREBASE_APP_ID as string) 
    : localConfig.appId,
};

const databaseId = isNotPlaceholder(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID)
  ? (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) 
  : localConfig.firestoreDatabaseId;

export const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 20;

if (!isConfigValid) {
  if (localConfig.apiKey && localConfig.apiKey.length > 20) {
    console.info("Using local Firebase configuration fallback.");
  } else {
    console.warn("Firebase Configuration is missing or invalid! Some features may not work.");
  }
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, databaseId || '(default)');

// Robust initialization for iframe environments
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

export const googleProvider = new GoogleAuthProvider();

export const signIn = () => signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
export const logOut = () => signOut(auth);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.", error);
    } else {
      console.error("Connection test failed:", error);
    }
  }
}
testConnection();
