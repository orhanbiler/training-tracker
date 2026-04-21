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
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { firebaseEnabled, getFirebase } from "./firebase";
import {
  MOCK_AUDIT,
  MOCK_FILES,
  MOCK_OFFICERS,
  MOCK_TRAINING,
} from "./mock-data";
import type { AttachedFile, Audit, Officer, TrainingSession } from "./types";

interface StoreValue {
  officers: Officer[];
  training: TrainingSession[];
  files: AttachedFile[];
  audit: Audit[];
  now: Date;
  /** `true` if we're using live Firestore listeners, `false` for mock data. */
  live: boolean;
  /** Renew a certification by pushing its expiration forward by 365 days. */
  renewCertification: (officerId: string, certId: string) => void;
  /** Assign an officer to a training session. */
  assignToTraining: (trainingId: string, officerId: string) => void;
  /** Log an audit event. */
  logAudit: (entry: Omit<Audit, "id" | "timestamp">) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function mapSnapshot<T>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [training, setTraining] = useState<TrainingSession[]>(MOCK_TRAINING);
  const [files, setFiles] = useState<AttachedFile[]>(MOCK_FILES);
  const [audit, setAudit] = useState<Audit[]>(MOCK_AUDIT);
  const [now, setNow] = useState<Date>(() => new Date());

  // Tick clock every 30s so "days remaining" / urgency stays fresh
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Wire Firestore listeners when configured
  useEffect(() => {
    if (!firebaseEnabled) return;
    const fb = getFirebase();
    if (!fb) return;
    const unsubs: Array<() => void> = [];
    unsubs.push(
      onSnapshot(collection(fb.db, "officers"), (s) => {
        const rows = mapSnapshot<Officer>(s);
        if (rows.length) setOfficers(rows);
      }),
    );
    unsubs.push(
      onSnapshot(collection(fb.db, "training"), (s) => {
        const rows = mapSnapshot<TrainingSession>(s);
        if (rows.length) setTraining(rows);
      }),
    );
    unsubs.push(
      onSnapshot(collection(fb.db, "files"), (s) => {
        const rows = mapSnapshot<AttachedFile>(s);
        if (rows.length) setFiles(rows);
      }),
    );
    unsubs.push(
      onSnapshot(collection(fb.db, "audit"), (s) => {
        const rows = mapSnapshot<Audit>(s);
        if (rows.length) setAudit(rows);
      }),
    );
    return () => unsubs.forEach((fn) => fn());
  }, []);

  const logAudit = useCallback((entry: Omit<Audit, "id" | "timestamp">) => {
    setAudit((prev) => [
      {
        id: `a-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...entry,
      },
      ...prev,
    ]);
  }, []);

  const renewCertification = useCallback(
    (officerId: string, certId: string) => {
      setOfficers((prev) =>
        prev.map((o) => {
          if (o.id !== officerId) return o;
          return {
            ...o,
            certifications: o.certifications.map((c) => {
              if (c.id !== certId) return c;
              const next = new Date();
              next.setFullYear(next.getFullYear() + 1);
              return {
                ...c,
                issuedAt: new Date().toISOString(),
                expiresAt: next.toISOString(),
              };
            }),
          };
        }),
      );
      logAudit({
        actor: "admin",
        action: "renewed",
        target: `${officerId} / ${certId.split("-").pop()}`,
      });
    },
    [logAudit],
  );

  const assignToTraining = useCallback(
    (trainingId: string, officerId: string) => {
      setTraining((prev) =>
        prev.map((t) =>
          t.id === trainingId && !t.assignedOfficerIds.includes(officerId)
            ? { ...t, assignedOfficerIds: [...t.assignedOfficerIds, officerId] }
            : t,
        ),
      );
      logAudit({
        actor: "admin",
        action: "assigned",
        target: `${officerId} → ${trainingId}`,
      });
    },
    [logAudit],
  );

  const value = useMemo<StoreValue>(
    () => ({
      officers,
      training,
      files,
      audit,
      now,
      live: firebaseEnabled,
      renewCertification,
      assignToTraining,
      logAudit,
    }),
    [
      officers,
      training,
      files,
      audit,
      now,
      renewCertification,
      assignToTraining,
      logAudit,
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
