import { Certification, CertStatus, Officer } from "./types";
import { daysBetween } from "./utils";

export const EXPIRING_WINDOW_DAYS = 30;

export function getCertStatus(cert: Certification, now: Date = new Date()): CertStatus {
  const days = daysBetween(now, new Date(cert.expiresAt));
  if (days < 0) return "expired";
  if (days <= EXPIRING_WINDOW_DAYS) return "expiring";
  return "compliant";
}

export function getCertDaysRemaining(cert: Certification, now: Date = new Date()): number {
  return daysBetween(now, new Date(cert.expiresAt));
}

export function getOfficerStatus(officer: Officer, now: Date = new Date()): CertStatus {
  let worst: CertStatus = "compliant";
  for (const c of officer.certifications) {
    const s = getCertStatus(c, now);
    if (s === "expired") return "expired";
    if (s === "expiring") worst = "expiring";
  }
  return worst;
}

export function getSoonestExpiry(officer: Officer, now: Date = new Date()): Certification | null {
  if (officer.certifications.length === 0) return null;
  return [...officer.certifications].sort(
    (a, b) => getCertDaysRemaining(a, now) - getCertDaysRemaining(b, now),
  )[0];
}

export const STATUS_LABEL: Record<CertStatus, string> = {
  compliant: "COMPLIANT",
  expiring: "EXPIRING",
  expired: "EXPIRED",
};

export const STATUS_COLOR: Record<CertStatus, string> = {
  compliant: "var(--color-ok)",
  expiring: "var(--color-warn)",
  expired: "var(--color-danger)",
};
