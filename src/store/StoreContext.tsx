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
import { getSupabase } from "@/src/lib/supabase";
import {
  fetchAll,
  seedCloudIfEmpty,
  dbInsertDress,
  dbUpdateDress,
  dbInsertRental,
  dbUpdateRental,
  dbInsertReturn,
} from "@/src/lib/supabaseRepo";

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
  /** "cloud" when Supabase env vars are set and reachable, otherwise localStorage. */
  dataSource: "cloud" | "local";
  cloudError: string | null;
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
  addDress: (input: AddDressInput) => Promise<Dress>;
  updateDress: (id: string, patch: Partial<Dress>) => Promise<void>;
  archiveDress: (id: string) => Promise<void>;
  addRental: (input: AddRentalInput) => Promise<Rental>;
  addRentalByName: (input: AddRentalByNameInput) => Promise<{ rental: Rental; matchedDress?: Dress; createdDress?: Dress }>;
  completeReturn: (input: ReturnInput) => Promise<void>;
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

// Guards double seeding under React StrictMode double-mount.
let cloudSeedPromise: Promise<unknown> | null = null;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [dataSource, setDataSource] = useState<"cloud" | "local">("local");
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const rentalsRef = useRef<Rental[]>([]);
  const dressesRef = useRef<Dress[]>([]);
  const cloudRef = useRef(false);
  useEffect(() => {
    rentalsRef.current = rentals;
  }, [rentals]);
  useEffect(() => {
    dressesRef.current = dresses;
  }, [dresses]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = getSupabase();
      if (sb) {
        try {
          let data = await fetchAll(sb);
          if (data.dresses.length === 0 && data.rentals.length === 0) {
            if (!cloudSeedPromise) cloudSeedPromise = seedCloudIfEmpty(sb);
            const seeded = (await cloudSeedPromise) as Awaited<ReturnType<typeof seedCloudIfEmpty>>;
            if (seeded) data = seeded;
          }
          if (cancelled) return;
          cloudRef.current = true;
          setDataSource("cloud");
          setDresses(data.dresses);
          setRentals(data.rentals);
          setReturns(data.returns);
        } catch (err) {
          if (cancelled) return;
          // Never lock the owner out: fall back to local data.
          setCloudError(err instanceof Error ? err.message : "Could not reach Supabase.");
          loadLocal();
        }
      } else {
        loadLocal();
      }
      if (!cancelled) setReady(true);

      function loadLocal() {
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
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || cloudRef.current) return;
    saveDresses(dresses);
  }, [dresses, ready]);

  useEffect(() => {
    if (!ready || cloudRef.current) return;
    saveRentals(rentals);
  }, [rentals, ready]);

  useEffect(() => {
    if (!ready || cloudRef.current) return;
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

  const addDress = useCallback(async (input: AddDressInput) => {
    const sb = getSupabase();
    if (sb && cloudRef.current) {
      const created = await dbInsertDress(sb, {
        dress_name: input.dress_name.trim(),
        quantity: input.quantity,
        rental_price: input.rental_price,
        date_added: input.date_added,
        status: input.status,
      });
      setDresses((prev) => [created, ...prev]);
      return created;
    }
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
    return dress;
  }, []);

  const updateDress = useCallback(async (id: string, patch: Partial<Dress>) => {
    const sb = getSupabase();
    if (sb && cloudRef.current) {
      const updated = await dbUpdateDress(sb, id, patch);
      setDresses((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return;
    }
    setDresses((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, ...patch, updated_at: nowISO() } : d
      )
    );
  }, []);

  const archiveDress = useCallback(async (id: string) => {
    const sb = getSupabase();
    if (sb && cloudRef.current) {
      const updated = await dbUpdateDress(sb, id, { status: "Archived" });
      setDresses((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return;
    }
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
  const addRentalByName = useCallback(async (input: AddRentalByNameInput) => {
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

    const sb = getSupabase();
    const matched = dressesRef.current.find(
      (d) => d.status !== "Archived" && normalizeDressName(d.dress_name) === norm
    );

    if (sb && cloudRef.current) {
      let dressId: string | null = null;
      let matchedDress: Dress | undefined;
      let createdDress: Dress | undefined;

      if (matched) {
        dressId = matched.id;
        matchedDress = await dbUpdateDress(sb, matched.id, { status: "Rented" });
        setDresses((prev) => prev.map((d) => (d.id === matched.id ? matchedDress as Dress : d)));
      } else if (input.addToInventory) {
        createdDress = await dbInsertDress(sb, {
          dress_name: dressName,
          quantity: 1,
          rental_price: input.rental_fee,
          date_added: input.rental_date,
          status: "Rented",
        });
        dressId = createdDress.id;
        setDresses((prev) => [createdDress as Dress, ...prev]);
      }

      const rental = await dbInsertRental(sb, {
        dress_name: dressName,
        dress_id: dressId,
        customer_name: input.customer_name.trim(),
        rental_date: input.rental_date,
        expected_return_date: input.expected_return_date,
        rental_fee: input.rental_fee,
      });
      setRentals((prev) => [rental, ...prev]);
      return { rental, matchedDress, createdDress };
    }

    const now = nowISO();
    let dressId: string | null = null;
    let matchedDress: Dress | undefined;
    let createdDress: Dress | undefined;

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
    return { rental, matchedDress, createdDress };
  }, []);

  /** Legacy id-based entry (inventory shortcut) — delegates to manual-entry logic. */
  const addRental = useCallback(
    async (input: AddRentalInput) => {
      const dress = dressesRef.current.find((d) => d.id === input.dress_id);
      const name = dress ? dress.dress_name : input.dress_id;
      const { rental } = await addRentalByName({
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

  const completeReturn = useCallback(async (input: ReturnInput) => {
    const sb = getSupabase();
    const target = rentalsRef.current.find((r) => r.id === input.rental_id);
    const dressId = target?.dress_id ?? null;
    const nextStatus = input.markUnavailable || input.condition === "Damaged" ? "Unavailable" : "Available";

    if (sb && cloudRef.current) {
      const updated = await dbUpdateRental(sb, input.rental_id, {
        status: "Returned",
        actual_return_date: input.actual_return_date,
        condition: input.condition,
        remarks: input.remarks,
      });
      setRentals((prev) => prev.map((r) => (r.id === input.rental_id ? updated : r)));
      const ret = await dbInsertReturn(sb, {
        rental_id: input.rental_id,
        actual_return_date: input.actual_return_date,
        condition: input.condition,
        remarks: input.remarks,
      });
      setReturns((prev) => [ret, ...prev]);
      if (dressId) {
        const updatedDress = await dbUpdateDress(sb, dressId, { status: nextStatus as Dress["status"] });
        setDresses((prev) => prev.map((d) => (d.id === dressId ? updatedDress : d)));
      }
      return;
    }

    const now = nowISO();
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
                status: nextStatus as Dress["status"],
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
    dataSource,
    cloudError,
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
