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
  addDoc,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firebaseDb } from "./firebase";
import { useAuth } from "./auth";
import type { AttachedFile, Audit, Officer, TrainingSession } from "./types";

interface StoreValue {
  officers: Officer[];
  training: TrainingSession[];
  files: AttachedFile[];
  audit: Audit[];
  now: Date;
  loading: boolean;
  isEmpty: boolean;
  renewCertification: (officerId: string, certId: string) => Promise<void>;
  assignToTraining: (trainingId: string, officerId: string) => Promise<void>;
  logAudit: (entry: Omit<Audit, "id" | "timestamp">) => Promise<void>;
  createOfficer: (
    data: Omit<Officer, "id" | "certifications"> & {
      certifications?: Officer["certifications"];
    },
  ) => Promise<string>;
  addCertification: (
    officerId: string,
    cert: { code: string; name: string; issuedAt: string; expiresAt: string },
  ) => Promise<void>;
  attachFile: (file: Omit<AttachedFile, "id">) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

function mapSnapshot<T>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [officers, setOfficers] = useState<Officer[]>([]);
  const [training, setTraining] = useState<TrainingSession[]>([]);
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [now, setNow] = useState<Date>(() => new Date());

  const [officersLoaded, setOfficersLoaded] = useState(false);
  const [trainingLoaded, setTrainingLoaded] = useState(false);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [auditLoaded, setAuditLoaded] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    const db = firebaseDb();
    const unsubs: Array<() => void> = [
      onSnapshot(collection(db, "officers"), (s) => {
        setOfficers(mapSnapshot<Officer>(s));
        setOfficersLoaded(true);
      }),
      onSnapshot(collection(db, "training"), (s) => {
        setTraining(mapSnapshot<TrainingSession>(s));
        setTrainingLoaded(true);
      }),
      onSnapshot(collection(db, "files"), (s) => {
        setFiles(mapSnapshot<AttachedFile>(s));
        setFilesLoaded(true);
      }),
      onSnapshot(collection(db, "audit"), (s) => {
        const rows = mapSnapshot<Audit>(s).sort((a, b) =>
          (b.timestamp ?? "").localeCompare(a.timestamp ?? ""),
        );
        setAudit(rows);
        setAuditLoaded(true);
      }),
    ];
    return () => {
      unsubs.forEach((fn) => fn());
      // Clearing flags on unsubscribe is a cleanup action, not synchronous
      // state-in-effect — it's only ever called on teardown.
      setOfficersLoaded(false);
      setTrainingLoaded(false);
      setFilesLoaded(false);
      setAuditLoaded(false);
    };
  }, [user]);

  const actor = user?.email ?? "system";

  const logAudit = useCallback(
    async (entry: Omit<Audit, "id" | "timestamp">) => {
      const db = firebaseDb();
      await addDoc(collection(db, "audit"), {
        ...entry,
        timestamp: new Date().toISOString(),
        serverTs: serverTimestamp(),
      });
    },
    [],
  );

  const renewCertification = useCallback(
    async (officerId: string, certId: string) => {
      const db = firebaseDb();
      const ref = doc(db, "officers", officerId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const o = snap.data() as Officer;
      const next = new Date();
      next.setFullYear(next.getFullYear() + 1);
      const certifications = o.certifications.map((c) =>
        c.id === certId
          ? {
              ...c,
              issuedAt: new Date().toISOString(),
              expiresAt: next.toISOString(),
            }
          : c,
      );
      await updateDoc(ref, { certifications });
      const certCode = o.certifications.find((c) => c.id === certId)?.code;
      await logAudit({
        actor,
        action: "renewed",
        target: `${o.name} / ${certCode ?? certId}`,
      });
    },
    [actor, logAudit],
  );

  const assignToTraining = useCallback(
    async (trainingId: string, officerId: string) => {
      const db = firebaseDb();
      const ref = doc(db, "training", trainingId);
      await updateDoc(ref, {
        assignedOfficerIds: arrayUnion(officerId),
      });
      await logAudit({
        actor,
        action: "assigned",
        target: `${officerId} → ${trainingId}`,
      });
    },
    [actor, logAudit],
  );

  const createOfficer = useCallback<StoreValue["createOfficer"]>(
    async (data) => {
      const db = firebaseDb();
      const ref = await addDoc(collection(db, "officers"), {
        name: data.name,
        badge: data.badge,
        rank: data.rank,
        unit: data.unit,
        certifications: data.certifications ?? [],
      });
      await logAudit({
        actor,
        action: "created officer",
        target: `${data.name} #${data.badge}`,
      });
      return ref.id;
    },
    [actor, logAudit],
  );

  const addCertification = useCallback(
    async (
      officerId: string,
      cert: {
        code: string;
        name: string;
        issuedAt: string;
        expiresAt: string;
      },
    ) => {
      const db = firebaseDb();
      const ref = doc(db, "officers", officerId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const o = snap.data() as Officer;
      const certId = `${officerId}-${cert.code}-${Date.now()}`;
      const certifications = [...o.certifications, { id: certId, ...cert }];
      await updateDoc(ref, { certifications });
      await logAudit({
        actor,
        action: "added cert",
        target: `${o.name} / ${cert.code}`,
      });
    },
    [actor, logAudit],
  );

  const attachFile = useCallback(
    async (file: Omit<AttachedFile, "id">) => {
      const db = firebaseDb();
      const ref = await addDoc(collection(db, "files"), file);
      await logAudit({
        actor,
        action: "uploaded",
        target: file.name,
      });
      // Touch the doc so the id lives on it too (optional)
      await setDoc(ref, { ...file }, { merge: true });
    },
    [actor, logAudit],
  );

  const loading =
    !user ||
    !officersLoaded ||
    !trainingLoaded ||
    !filesLoaded ||
    !auditLoaded;

  const isEmpty =
    officersLoaded &&
    trainingLoaded &&
    officers.length === 0 &&
    training.length === 0;

  const value = useMemo<StoreValue>(
    () => ({
      officers,
      training,
      files,
      audit,
      now,
      loading,
      isEmpty,
      renewCertification,
      assignToTraining,
      logAudit,
      createOfficer,
      addCertification,
      attachFile,
    }),
    [
      officers,
      training,
      files,
      audit,
      now,
      loading,
      isEmpty,
      renewCertification,
      assignToTraining,
      logAudit,
      createOfficer,
      addCertification,
      attachFile,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
