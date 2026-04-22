"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  User as FbUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "./firebase";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  initials: string;
  photoURL: string | null;
  role: "admin" | "viewer";
}

interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

function initialsFor(name: string, email: string): string {
  const source = (name || email || "").trim();
  if (!source) return "??";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

async function hydrateUser(fb: FbUser): Promise<AuthUser> {
  const db = firebaseDb();
  const ref = doc(db, "users", fb.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // First-time sign in — create a profile doc.
    const displayName =
      fb.displayName || fb.email?.split("@")[0] || "Officer";
    await setDoc(ref, {
      email: fb.email,
      displayName,
      photoURL: fb.photoURL ?? null,
      role: "admin", // first users get admin; refine later with real rbac
      createdAt: serverTimestamp(),
    });
    return {
      uid: fb.uid,
      email: fb.email ?? "",
      displayName,
      initials: initialsFor(displayName, fb.email ?? ""),
      photoURL: fb.photoURL ?? null,
      role: "admin",
    };
  }

  const data = snap.data();
  const displayName =
    data.displayName || fb.displayName || fb.email?.split("@")[0] || "Officer";
  return {
    uid: fb.uid,
    email: fb.email ?? data.email ?? "",
    displayName,
    initials: initialsFor(displayName, fb.email ?? ""),
    photoURL: fb.photoURL ?? data.photoURL ?? null,
    role: (data.role as "admin" | "viewer") ?? "viewer",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = firebaseAuth();
    // Persist sessions across tabs / reloads
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    const unsub = onAuthStateChanged(auth, async (fb) => {
      if (!fb) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const hydrated = await hydrateUser(fb);
        setUser(hydrated);
      } catch {
        // If profile hydration fails, still surface minimal user
        setUser({
          uid: fb.uid,
          email: fb.email ?? "",
          displayName: fb.displayName ?? fb.email ?? "Officer",
          initials: initialsFor(fb.displayName ?? "", fb.email ?? ""),
          photoURL: fb.photoURL ?? null,
          role: "viewer",
        });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth(), email, password);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const cred = await createUserWithEmailAndPassword(
        firebaseAuth(),
        email,
        password,
      );
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(firebaseAuth(), provider);
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(firebaseAuth());
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, loading, signIn, signUp, signInWithGoogle, signOut }),
    [user, loading, signIn, signUp, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
