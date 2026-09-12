"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Dress, Rental, ReturnRecord, ReturnCondition } from "@/src/lib/types";
import {
  loadDresses,
  loadRentals,
  loadReturns,
  saveDresses,
  saveRentals,
  saveReturns,
  seedIfNeeded,
} from "@/src/lib/storage";
import { buildSeed } from "@/src/lib/seed";
import { isOverdue, isDueToday, normalizeDressName, nowISO, uid } from "@/src/lib/utils";

interface AddDressInput {
  dress_name: string;
  quantity: number;
  rental_price: number;
  date_added: string;
  status: Dress["status"];
}

interface AddRentalInput {
  dress_id: string;
  customer_name: string;
  rental_date: string;
  expected_return_date: string;
  rental_fee: number;
}

/** Manual-entry rental input — dress name is typed, not selected. */
export interface AddRentalByNameInput {
  dress_name: string;
  customer_name: string;
  rental_date: string;
  expected_return_date: string;
  rental_fee: number;
  /** When the dress is not in inventory: true creates it, false records a standalone rental. */
  addToInventory?: boolean;
}

interface ReturnInput {
  rental_id: string;
  actual_return_date: string;
  condition: ReturnCondition;
  remarks: string;
  markUnavailable?: boolean;
}

interface StoreState {
  ready: boolean;
  dresses: Dress[];
  rentals: Rental[];
  returns: ReturnRecord[];
  activeRentals: Rental[];
  dueToday: Rental[];
  overdue: Rental[];
  totalDresses: number;
  availableCount: number;
  rentedCount: number;
  dressById: (id: string) => Dress | undefined;
  findDressByName: (name: string) => Dress | undefined;
  activeRentalForName: (name: string) => Rental | undefined;
  rentalsForDress: (dressId: string) => Rental[];
  rentalsForName: (name: string) => Rental[];
  activeRentalForDress: (dressId: string) => Rental | undefined;
  addDress: (input: AddDressInput) => Dress;
  updateDress: (id: string, patch: Partial<Dress>) => void;
  archiveDress: (id: string) => void;
  addRental: (input: AddRentalInput) => Rental;
  addRentalByName: (input: AddRentalByNameInput) => { rental: Rental; matchedDress?: Dress; createdDress?: Dress };
  completeReturn: (input: ReturnInput) => void;
}

const StoreContext = createContext<StoreState | null>(null);

/** Backfill dress_name for rentals stored before manual-entry (link via dress_id). */
function backfillRentalNames(rentals: Rental[], dresses: Dress[]): Rental[] {
  let changed = false;
  const mapped = rentals.map((r) => {
    if (r.dress_name && r.dress_name.trim()) return r;
    const d = dresses.find((x) => x.id === (r as Rental).dress_id);
    changed = true;
    return { ...r, dress_name: d ? d.dress_name : "Unknown dress" };
  });
  return changed ? mapped : rentals;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const rentalsRef = useRef<Rental[]>([]);
  const dressesRef = useRef<Dress[]>([]);
  useEffect(() => {
    rentalsRef.current = rentals;
  }, [rentals]);
  useEffect(() => {
    dressesRef.current = dresses;
  }, [dresses]);

  useEffect(() => {
    const d = loadDresses();
    const r = loadRentals();
    const ret = loadReturns();
    const seed = buildSeed();
    const seeded = seedIfNeeded(d, r, seed.dresses, seed.rentals, seed.returns);
    if (seeded) {
      setDresses(seeded.dresses);
      setRentals(backfillRentalNames(seeded.rentals, seeded.dresses));
      setReturns(seeded.returns);
    } else {
      setDresses(d);
      setRentals(backfillRentalNames(r, d));
      setReturns(ret);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveDresses(dresses);
  }, [dresses, ready]);

  useEffect(() => {
    if (!ready) return;
    saveRentals(rentals);
  }, [rentals, ready]);

  useEffect(() => {
    if (!ready) return;
    saveReturns(returns);
  }, [returns, ready]);

  const dressById = useCallback(
    (id: string) => dresses.find((d) => d.id === id),
    [dresses]
  );

  const findDressByName = useCallback(
    (name: string) => {
      const norm = normalizeDressName(name);
      if (!norm) return undefined;
      return dresses.find(
        (d) => d.status !== "Archived" && normalizeDressName(d.dress_name) === norm
      );
    },
    [dresses]
  );

  const activeRentalForName = useCallback(
    (name: string) => {
      const norm = normalizeDressName(name);
      if (!norm) return undefined;
      return rentals.find(
        (r) => r.status === "Rented" && normalizeDressName(r.dress_name) === norm
      );
    },
    [rentals]
  );

  const rentalsForName = useCallback(
    (name: string) => {
      const norm = normalizeDressName(name);
      return rentals
        .filter((r) => normalizeDressName(r.dress_name) === norm)
        .sort((a, b) => (a.rental_date < b.rental_date ? 1 : -1));
    },
    [rentals]
  );

  const rentalsForDress = useCallback(
    (dressId: string) => {
      const dress = dresses.find((d) => d.id === dressId);
      const norm = dress ? normalizeDressName(dress.dress_name) : null;
      return rentals
        .filter(
          (r) =>
            r.dress_id === dressId ||
            (norm !== null && normalizeDressName(r.dress_name) === norm)
        )
        .sort((a, b) => (a.rental_date < b.rental_date ? 1 : -1));
    },
    [rentals, dresses]
  );

  const activeRentalForDress = useCallback(
    (dressId: string) => {
      const dress = dresses.find((d) => d.id === dressId);
      const norm = dress ? normalizeDressName(dress.dress_name) : null;
      return rentals.find(
        (r) =>
          r.status === "Rented" &&
          (r.dress_id === dressId ||
            (norm !== null && normalizeDressName(r.dress_name) === norm))
      );
    },
    [rentals, dresses]
  );

  const addDress = useCallback((input: AddDressInput) => {
    const now = nowISO();
    const dress: Dress = {
      id: uid("dress"),
      dress_name: input.dress_name.trim(),
      quantity: input.quantity,
      rental_price: input.rental_price,
      date_added: input.date_added,
      status: input.status,
      created_at: now,
      updated_at: now,
    };
    setDresses((prev) => [dress, ...prev]);
    dressesRef.current = [dress, ...dressesRef.current];
    return dress;
  }, []);

  const updateDress = useCallback((id: string, patch: Partial<Dress>) => {
    setDresses((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, ...patch, updated_at: nowISO() } : d
      )
    );
  }, []);

  const archiveDress = useCallback((id: string) => {
    setDresses((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: "Archived" as const, updated_at: nowISO() } : d
      )
    );
  }, []);

  /**
   * Manual-entry rental (spec §§12–16):
   * - Blocks when the normalized dress name already has an active rental.
   * - Links + flips Available → Rented when the name matches inventory.
   * - Optionally creates the inventory record when the name is new.
   */
  const addRentalByName = useCallback((input: AddRentalByNameInput) => {
    const dressName = input.dress_name.trim().replace(/\s+/g, " ");
    const norm = normalizeDressName(dressName);
    if (!norm) throw new Error("Enter a dress name.");
    if (!input.customer_name.trim()) throw new Error("Enter a customer name.");

    const clash = rentalsRef.current.find(
      (r) => r.status === "Rented" && normalizeDressName(r.dress_name) === norm
    );
    if (clash) {
      throw new Error(
        "This dress is currently rented. Please check the rental records before creating a new rental."
      );
    }

    const now = nowISO();
    const matched = dressesRef.current.find(
      (d) => d.status !== "Archived" && normalizeDressName(d.dress_name) === norm
    );

    let dressId: string | null = null;
    let createdDress: Dress | undefined;
    let matchedDress: Dress | undefined;

    if (matched) {
      dressId = matched.id;
      matchedDress = matched;
      setDresses((prev) =>
        prev.map((d) =>
          d.id === matched.id ? { ...d, status: "Rented" as const, updated_at: now } : d
        )
      );
    } else if (input.addToInventory) {
      createdDress = {
        id: uid("dress"),
        dress_name: dressName,
        quantity: 1,
        rental_price: input.rental_fee,
        date_added: input.rental_date,
        status: "Rented",
        created_at: now,
        updated_at: now,
      };
      dressId = createdDress.id;
      setDresses((prev) => [createdDress as Dress, ...prev]);
    }

    const rental: Rental = {
      id: uid("rental"),
      dress_name: dressName,
      dress_id: dressId,
      customer_name: input.customer_name.trim(),
      rental_date: input.rental_date,
      expected_return_date: input.expected_return_date,
      rental_fee: input.rental_fee,
      status: "Rented",
      created_at: now,
      updated_at: now,
    };
    setRentals((prev) => [rental, ...prev]);
    rentalsRef.current = [rental, ...rentalsRef.current];
    return { rental, matchedDress, createdDress };
  }, []);

  /** Legacy id-based entry (inventory shortcut) — delegates to manual-entry logic. */
  const addRental = useCallback(
    (input: AddRentalInput) => {
      const dress = dressesRef.current.find((d) => d.id === input.dress_id);
      const name = dress ? dress.dress_name : input.dress_id;
      const { rental } = addRentalByName({
        dress_name: name,
        customer_name: input.customer_name,
        rental_date: input.rental_date,
        expected_return_date: input.expected_return_date,
        rental_fee: input.rental_fee,
      });
      return rental;
    },
    [addRentalByName]
  );

  const completeReturn = useCallback((input: ReturnInput) => {
    const now = nowISO();
    const target = rentalsRef.current.find((r) => r.id === input.rental_id);
    const dressId = target?.dress_id ?? null;
    setRentals((prev) =>
      prev.map((r) =>
        r.id === input.rental_id
          ? {
              ...r,
              status: "Returned" as const,
              actual_return_date: input.actual_return_date,
              condition: input.condition,
              remarks: input.remarks,
              updated_at: now,
            }
          : r
      )
    );
    setReturns((prev) => [
      {
        id: uid("return"),
        rental_id: input.rental_id,
        actual_return_date: input.actual_return_date,
        condition: input.condition,
        remarks: input.remarks,
        created_at: now,
      },
      ...prev,
    ]);
    // Rented -> Available (or Unavailable if damaged / flagged). Standalone rentals touch no inventory.
    if (dressId) {
      setDresses((dprev) =>
        dprev.map((d) =>
          d.id === dressId
            ? {
                ...d,
                status:
                  input.markUnavailable || input.condition === "Damaged"
                    ? ("Unavailable" as const)
                    : ("Available" as const),
                updated_at: now,
              }
            : d
        )
      );
    }
  }, []);

  const { activeRentals, dueToday, overdue } = useMemo(() => {
    const active = rentals.filter((r) => r.status === "Rented");
    const due = active.filter((r) => isDueToday(r.expected_return_date));
    const over = active.filter((r) => isOverdue(r.expected_return_date));
    return { activeRentals: active, dueToday: due, overdue: over };
  }, [rentals]);

  const visibleDresses = useMemo(
    () => dresses.filter((d) => d.status !== "Archived"),
    [dresses]
  );

  const value: StoreState = {
    ready,
    dresses,
    rentals,
    returns,
    activeRentals,
    dueToday,
    overdue,
    totalDresses: visibleDresses.reduce((s, d) => s + (d.quantity || 0), 0),
    availableCount: visibleDresses.filter((d) => d.status === "Available").length,
    rentedCount: visibleDresses.filter((d) => d.status === "Rented").length,
    dressById,
    findDressByName,
    activeRentalForName,
    rentalsForDress,
    rentalsForName,
    activeRentalForDress,
    addDress,
    updateDress,
    archiveDress,
    addRental,
    addRentalByName,
    completeReturn,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
