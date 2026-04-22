export interface CertCatalogEntry {
  code: string;
  name: string;
}

export const CERT_CATALOG: CertCatalogEntry[] = [
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
