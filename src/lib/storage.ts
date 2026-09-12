import type { Dress, Rental, ReturnRecord } from "./types";
import { todayISO, toISODate } from "./utils";

const DRESSES_KEY = "drs_dresses_v1";
const RENTALS_KEY = "drs_rentals_v1";
const RETURNS_KEY = "drs_returns_v1";
const SEEDED_KEY = "drs_seeded_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadDresses(): Dress[] {
  if (typeof window === "undefined") return [];
  return safeParse<Dress[]>(localStorage.getItem(DRESSES_KEY), []);
}

export function saveDresses(dresses: Dress[]) {
  localStorage.setItem(DRESSES_KEY, JSON.stringify(dresses));
}

export function loadRentals(): Rental[] {
  if (typeof window === "undefined") return [];
  return safeParse<Rental[]>(localStorage.getItem(RENTALS_KEY), []);
}

export function saveRentals(rentals: Rental[]) {
  localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals));
}

export function loadReturns(): ReturnRecord[] {
  if (typeof window === "undefined") return [];
  return safeParse<ReturnRecord[]>(localStorage.getItem(RETURNS_KEY), []);
}

export function saveReturns(returns: ReturnRecord[]) {
  localStorage.setItem(RETURNS_KEY, JSON.stringify(returns));
}

export function isSeeded(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SEEDED_KEY) === "1";
}

export function markSeeded() {
  localStorage.setItem(SEEDED_KEY, "1");
}

export function seedIfNeeded(
  dresses: Dress[],
  rentals: Rental[],
  seedDresses: Dress[],
  seedRentals: Rental[],
  seedReturns: ReturnRecord[]
): { dresses: Dress[]; rentals: Rental[]; returns: ReturnRecord[] } | null {
  if (isSeeded()) return null;
  if (dresses.length > 0 || rentals.length > 0) {
    markSeeded();
    return null;
  }
  saveDresses(seedDresses);
  saveRentals(seedRentals);
  saveReturns(seedReturns);
  markSeeded();
  return { dresses: seedDresses, rentals: seedRentals, returns: seedReturns };
}

export function defaultDateAdded(): string {
  return todayISO();
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

export function daysFromNowISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}
