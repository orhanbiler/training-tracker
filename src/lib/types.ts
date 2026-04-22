export type CertStatus = "compliant" | "expiring" | "expired";

export interface Certification {
  id: string;
  name: string;
  /** Short code used in dense rows / heatmap columns, e.g. "CPR" */
  code: string;
  issuedAt: string; // ISO date
  expiresAt: string; // ISO date
}

export interface Officer {
  id: string;
  name: string;
  badge: string;
  rank: string;
  unit: string;
  certifications: Certification[];
}

export interface TrainingSession {
  id: string;
  title: string;
  code: string;
  date: string; // ISO date
  durationHours: number;
  location: string;
  instructor: string;
  capacity: number;
  assignedOfficerIds: string[];
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  contentType?: string;
  uploadedAt: string; // ISO
  officerId: string;
  /** Optional — files can be attached to an officer without a specific cert. */
  certificationId?: string;
  /** Firebase Storage object path — used for deletion. */
  storagePath?: string;
  /** Public download URL returned by Firebase Storage. */
  downloadURL?: string;
  uploadedBy?: string;
}

export interface Audit {
  id: string;
  timestamp: string; // ISO
  actor: string;
  action: string;
  target: string;
}
