import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

/**
 * Firebase is optional in this demo. If any of the public env vars are
 * missing we fall through to the in-memory mock data layer. That keeps
 * the app fully operational in offline / preview environments while
 * still using real Firestore listeners when configured.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebase() {
  if (!firebaseEnabled) return null;
  if (!_app) {
    _app = getApps().length
      ? getApps()[0]
      : initializeApp(config as Record<string, string>);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  }
  return { app: _app!, auth: _auth!, db: _db! };
}
