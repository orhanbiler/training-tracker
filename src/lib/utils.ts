import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function daysBetween(a: Date, b: Date): number {
  const MS = 1000 * 60 * 60 * 24;
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / MS);
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function pad(n: number, width = 2): string {
  return n.toString().padStart(width, "0");
}
