import { AttachedFile, Audit, Officer, TrainingSession } from "./types";

/**
 * Deterministic demo dataset. Dates are generated relative to the current
 * day so the timeline always looks "live" without needing a real backend.
 */

function offsetDate(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const CERT_CATALOG = [
  { code: "FRA", name: "Firearms Qualification" },
  { code: "CPR", name: "CPR / AED" },
  { code: "TSR", name: "Taser Recertification" },
  { code: "DRV", name: "EVOC Driving" },
  { code: "DEF", name: "Defensive Tactics" },
  { code: "K9", name: "K-9 Handler" },
  { code: "CIT", name: "Crisis Intervention" },
  { code: "RAD", name: "Radar / Lidar" },
  { code: "FTO", name: "Field Training Officer" },
  { code: "SWT", name: "SWAT Qualification" },
];

export const CERTIFICATION_CODES = CERT_CATALOG.map((c) => c.code);
export const CERTIFICATION_NAMES: Record<string, string> = Object.fromEntries(
  CERT_CATALOG.map((c) => [c.code, c.name]),
);

type OfficerSeed = {
  id: string;
  name: string;
  badge: string;
  rank: string;
  unit: string;
  certs: Array<{ code: string; issuedOffset: number; expiresOffset: number }>;
};

const SEED: OfficerSeed[] = [
  {
    id: "o-1041",
    name: "M. Alvarez",
    badge: "1041",
    rank: "Sgt",
    unit: "Patrol A",
    certs: [
      { code: "FRA", issuedOffset: -340, expiresOffset: -5 },
      { code: "CPR", issuedOffset: -400, expiresOffset: 42 },
      { code: "TSR", issuedOffset: -300, expiresOffset: 12 },
      { code: "DRV", issuedOffset: -200, expiresOffset: 180 },
    ],
  },
  {
    id: "o-1122",
    name: "J. Okafor",
    badge: "1122",
    rank: "Ofc",
    unit: "Patrol B",
    certs: [
      { code: "FRA", issuedOffset: -120, expiresOffset: 245 },
      { code: "CPR", issuedOffset: -350, expiresOffset: 8 },
      { code: "DEF", issuedOffset: -90, expiresOffset: 270 },
    ],
  },
  {
    id: "o-1187",
    name: "R. Cheng",
    badge: "1187",
    rank: "Ofc",
    unit: "Traffic",
    certs: [
      { code: "RAD", issuedOffset: -700, expiresOffset: -22 },
      { code: "DRV", issuedOffset: -600, expiresOffset: -18 },
      { code: "CPR", issuedOffset: -300, expiresOffset: 120 },
      { code: "FRA", issuedOffset: -200, expiresOffset: 160 },
    ],
  },
  {
    id: "o-0904",
    name: "T. Brooks",
    badge: "0904",
    rank: "Det",
    unit: "Detectives",
    certs: [
      { code: "FRA", issuedOffset: -150, expiresOffset: 210 },
      { code: "CIT", issuedOffset: -400, expiresOffset: 25 },
      { code: "CPR", issuedOffset: -200, expiresOffset: 160 },
    ],
  },
  {
    id: "o-1301",
    name: "S. Nakamura",
    badge: "1301",
    rank: "Cpl",
    unit: "SWAT",
    certs: [
      { code: "SWT", issuedOffset: -220, expiresOffset: 148 },
      { code: "FRA", issuedOffset: -95, expiresOffset: 268 },
      { code: "DEF", issuedOffset: -140, expiresOffset: 221 },
      { code: "TSR", issuedOffset: -260, expiresOffset: 62 },
    ],
  },
  {
    id: "o-1012",
    name: "E. Petrov",
    badge: "1012",
    rank: "Ofc",
    unit: "Patrol A",
    certs: [
      { code: "FRA", issuedOffset: -365, expiresOffset: 3 },
      { code: "CPR", issuedOffset: -365, expiresOffset: 1 },
      { code: "DRV", issuedOffset: -400, expiresOffset: -32 },
    ],
  },
  {
    id: "o-1250",
    name: "A. Washington",
    badge: "1250",
    rank: "Ofc",
    unit: "K-9",
    certs: [
      { code: "K9", issuedOffset: -100, expiresOffset: 262 },
      { code: "FRA", issuedOffset: -80, expiresOffset: 285 },
      { code: "CPR", issuedOffset: -300, expiresOffset: 66 },
      { code: "DEF", issuedOffset: -220, expiresOffset: 140 },
    ],
  },
  {
    id: "o-1165",
    name: "D. Reilly",
    badge: "1165",
    rank: "Sgt",
    unit: "Patrol B",
    certs: [
      { code: "FTO", issuedOffset: -200, expiresOffset: 160 },
      { code: "FRA", issuedOffset: -310, expiresOffset: 55 },
      { code: "CPR", issuedOffset: -390, expiresOffset: 18 },
      { code: "CIT", issuedOffset: -150, expiresOffset: 215 },
    ],
  },
  {
    id: "o-1398",
    name: "L. Ibarra",
    badge: "1398",
    rank: "Ofc",
    unit: "Patrol C",
    certs: [
      { code: "FRA", issuedOffset: -60, expiresOffset: 305 },
      { code: "CPR", issuedOffset: -60, expiresOffset: 305 },
      { code: "DRV", issuedOffset: -60, expiresOffset: 305 },
    ],
  },
  {
    id: "o-0871",
    name: "K. Fitzgerald",
    badge: "0871",
    rank: "Lt",
    unit: "Admin",
    certs: [
      { code: "FRA", issuedOffset: -340, expiresOffset: 22 },
      { code: "CPR", issuedOffset: -200, expiresOffset: 160 },
    ],
  },
  {
    id: "o-1444",
    name: "B. Andersen",
    badge: "1444",
    rank: "Ofc",
    unit: "Traffic",
    certs: [
      { code: "RAD", issuedOffset: -50, expiresOffset: 315 },
      { code: "DRV", issuedOffset: -40, expiresOffset: 325 },
      { code: "CPR", issuedOffset: -360, expiresOffset: 5 },
      { code: "FRA", issuedOffset: -180, expiresOffset: 185 },
    ],
  },
  {
    id: "o-0733",
    name: "N. Kowalski",
    badge: "0733",
    rank: "Det",
    unit: "Detectives",
    certs: [
      { code: "CIT", issuedOffset: -240, expiresOffset: -3 },
      { code: "FRA", issuedOffset: -190, expiresOffset: 175 },
      { code: "CPR", issuedOffset: -280, expiresOffset: 85 },
    ],
  },
];

export const MOCK_OFFICERS: Officer[] = SEED.map((s) => ({
  id: s.id,
  name: s.name,
  badge: s.badge,
  rank: s.rank,
  unit: s.unit,
  certifications: s.certs.map((c) => ({
    id: `${s.id}-${c.code}`,
    code: c.code,
    name: CERTIFICATION_NAMES[c.code],
    issuedAt: offsetDate(c.issuedOffset),
    expiresAt: offsetDate(c.expiresOffset),
  })),
}));

export const MOCK_TRAINING: TrainingSession[] = [
  {
    id: "t-001",
    title: "Firearms Requalification",
    code: "FRA",
    date: offsetDate(3),
    durationHours: 4,
    location: "Range 2",
    instructor: "Sgt. Alvarez",
    capacity: 12,
    assignedOfficerIds: ["o-1041", "o-1012", "o-0871"],
  },
  {
    id: "t-002",
    title: "CPR / AED Recert",
    code: "CPR",
    date: offsetDate(6),
    durationHours: 3,
    location: "HQ Training Rm B",
    instructor: "EMS Corps",
    capacity: 20,
    assignedOfficerIds: ["o-1122", "o-1012", "o-1444"],
  },
  {
    id: "t-003",
    title: "Crisis Intervention Team",
    code: "CIT",
    date: offsetDate(10),
    durationHours: 8,
    location: "Academy",
    instructor: "Dr. Patel",
    capacity: 16,
    assignedOfficerIds: ["o-0904", "o-0733"],
  },
  {
    id: "t-004",
    title: "Taser Recertification",
    code: "TSR",
    date: offsetDate(14),
    durationHours: 2,
    location: "HQ Training Rm A",
    instructor: "Cpl. Nakamura",
    capacity: 10,
    assignedOfficerIds: ["o-1041"],
  },
  {
    id: "t-005",
    title: "EVOC Driving",
    code: "DRV",
    date: offsetDate(21),
    durationHours: 6,
    location: "Driver Track",
    instructor: "Ofc. Reilly",
    capacity: 8,
    assignedOfficerIds: ["o-1187", "o-1012"],
  },
  {
    id: "t-006",
    title: "Radar / Lidar Recert",
    code: "RAD",
    date: offsetDate(28),
    durationHours: 2,
    location: "Traffic Div.",
    instructor: "Lt. Fitzgerald",
    capacity: 12,
    assignedOfficerIds: ["o-1187"],
  },
];

export const MOCK_FILES: AttachedFile[] = [
  {
    id: "f-001",
    name: "alvarez-firearms-2025.pdf",
    size: 482_391,
    uploadedAt: offsetDate(-180),
    officerId: "o-1041",
    certificationId: "o-1041-FRA",
  },
  {
    id: "f-002",
    name: "okafor-cpr-card.jpg",
    size: 118_220,
    uploadedAt: offsetDate(-350),
    officerId: "o-1122",
    certificationId: "o-1122-CPR",
  },
  {
    id: "f-003",
    name: "cheng-radar-cert.pdf",
    size: 302_110,
    uploadedAt: offsetDate(-700),
    officerId: "o-1187",
    certificationId: "o-1187-RAD",
  },
  {
    id: "f-004",
    name: "nakamura-swat-quals.pdf",
    size: 711_844,
    uploadedAt: offsetDate(-220),
    officerId: "o-1301",
    certificationId: "o-1301-SWT",
  },
  {
    id: "f-005",
    name: "washington-k9-eval.pdf",
    size: 284_401,
    uploadedAt: offsetDate(-100),
    officerId: "o-1250",
    certificationId: "o-1250-K9",
  },
];

export const MOCK_AUDIT: Audit[] = [
  {
    id: "a-001",
    timestamp: offsetDate(0),
    actor: "admin",
    action: "renewed",
    target: "o-1041 / FRA",
  },
  {
    id: "a-002",
    timestamp: offsetDate(-1),
    actor: "admin",
    action: "assigned",
    target: "o-1122 → CPR session",
  },
  {
    id: "a-003",
    timestamp: offsetDate(-2),
    actor: "admin",
    action: "uploaded",
    target: "nakamura-swat-quals.pdf",
  },
];
