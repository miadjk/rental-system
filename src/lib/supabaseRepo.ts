import type { SupabaseClient } from "@supabase/supabase-js";
import type { Dress, Rental, ReturnRecord } from "./types";
import { buildSeed } from "./seed";
import { nowISO } from "./utils";

// PostgREST returns NUMERIC columns as strings — coerce everything.
function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

function mapDress(row: Record<string, unknown>): Dress {
  return {
    id: String(row.id),
    dress_name: String(row.dress_name ?? ""),
    quantity: num(row.quantity, 1),
    rental_price: num(row.rental_price),
    date_added: String(row.date_added ?? ""),
    status: (row.status as Dress["status"]) ?? "Available",
    created_at: String(row.created_at ?? nowISO()),
    updated_at: String(row.updated_at ?? nowISO()),
  };
}

function mapRental(row: Record<string, unknown>): Rental {
  return {
    id: String(row.id),
    dress_name: String(row.dress_name ?? ""),
    dress_id: row.dress_id == null ? null : String(row.dress_id),
    customer_name: String(row.customer_name ?? ""),
    rental_date: String(row.rental_date ?? ""),
    expected_return_date: String(row.expected_return_date ?? ""),
    actual_return_date: row.actual_return_date == null ? undefined : String(row.actual_return_date),
    rental_fee: num(row.rental_fee),
    status: (row.status as Rental["status"]) ?? "Rented",
    condition: (row.condition as Rental["condition"]) ?? undefined,
    remarks: String(row.remarks ?? ""),
    created_at: String(row.created_at ?? nowISO()),
    updated_at: String(row.updated_at ?? nowISO()),
  };
}

function mapReturn(row: Record<string, unknown>): ReturnRecord {
  return {
    id: String(row.id),
    rental_id: String(row.rental_id ?? ""),
    actual_return_date: String(row.actual_return_date ?? ""),
    condition: (row.condition as ReturnRecord["condition"]) ?? "Good",
    remarks: String(row.remarks ?? ""),
    created_at: String(row.created_at ?? nowISO()),
  };
}

function throwIf(error: { message: string } | null, what: string): void {
  if (error) throw new Error(`Supabase ${what} failed: ${error.message}`);
}

export async function fetchAll(sb: SupabaseClient): Promise<{
  dresses: Dress[];
  rentals: Rental[];
  returns: ReturnRecord[];
}> {
  const [d, r, ret] = await Promise.all([
    sb.from("dresses").select("*").order("created_at", { ascending: false }),
    sb.from("rentals").select("*").order("created_at", { ascending: false }),
    sb.from("returns").select("*").order("created_at", { ascending: false }),
  ]);
  throwIf(d.error, "load dresses");
  throwIf(r.error, "load rentals");
  throwIf(ret.error, "load returns");
  return {
    dresses: (d.data ?? []).map(mapDress),
    rentals: (r.data ?? []).map(mapRental),
    returns: (ret.data ?? []).map(mapReturn),
  };
}

export async function dbInsertDress(
  sb: SupabaseClient,
  input: { dress_name: string; quantity: number; rental_price: number; date_added: string; status: Dress["status"] }
): Promise<Dress> {
  const { data, error } = await sb.from("dresses").insert(input).select().single();
  throwIf(error, "add dress");
  return mapDress(data as Record<string, unknown>);
}

export async function dbUpdateDress(
  sb: SupabaseClient,
  id: string,
  patch: Partial<Pick<Dress, "dress_name" | "quantity" | "rental_price" | "date_added" | "status">>
): Promise<Dress> {
  const { data, error } = await sb.from("dresses").update(patch).eq("id", id).select().single();
  throwIf(error, "update dress");
  return mapDress(data as Record<string, unknown>);
}

export async function dbInsertRental(
  sb: SupabaseClient,
  input: {
    dress_name: string;
    dress_id: string | null;
    customer_name: string;
    rental_date: string;
    expected_return_date: string;
    rental_fee: number;
  }
): Promise<Rental> {
  const { data, error } = await sb.from("rentals").insert(input).select().single();
  throwIf(error, "add rental");
  return mapRental(data as Record<string, unknown>);
}

export async function dbUpdateRental(
  sb: SupabaseClient,
  id: string,
  patch: Partial<Pick<Rental, "status" | "actual_return_date" | "condition" | "remarks">>
): Promise<Rental> {
  const { data, error } = await sb.from("rentals").update(patch).eq("id", id).select().single();
  throwIf(error, "update rental");
  return mapRental(data as Record<string, unknown>);
}

export async function dbInsertReturn(
  sb: SupabaseClient,
  input: { rental_id: string; actual_return_date: string; condition: ReturnRecord["condition"]; remarks: string }
): Promise<ReturnRecord> {
  const { data, error } = await sb.from("returns").insert(input).select().single();
  throwIf(error, "record return");
  return mapReturn(data as Record<string, unknown>);
}

/**
 * Pushes the prototype seed into empty cloud tables.
 * Seed ids are local text keys — the DB generates uuids, linked by dress name.
 */
export async function seedCloudIfEmpty(sb: SupabaseClient): Promise<{
  dresses: Dress[];
  rentals: Rental[];
  returns: ReturnRecord[];
} | null> {
  const { count } = await sb.from("dresses").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return null;

  const seed = buildSeed();
  const dressIdByName = new Map<string, string>();

  for (const d of seed.dresses) {
    const created = await dbInsertDress(sb, {
      dress_name: d.dress_name,
      quantity: d.quantity,
      rental_price: d.rental_price,
      date_added: d.date_added,
      status: d.status,
    });
    dressIdByName.set(d.dress_name, created.id);
  }

  const rentalIdByKey = new Map<string, string>();
  for (const r of seed.rentals) {
    const created = await dbInsertRental(sb, {
      dress_name: r.dress_name,
      dress_id: dressIdByName.get(r.dress_name) ?? null,
      customer_name: r.customer_name,
      rental_date: r.rental_date,
      expected_return_date: r.expected_return_date,
      rental_fee: r.rental_fee,
    });
    // Mirror the seed's returned state (app seed ships 3 returned rentals).
    if (r.status === "Returned") {
      await dbUpdateRental(sb, created.id, {
        status: "Returned",
        actual_return_date: r.actual_return_date,
        condition: r.condition,
        remarks: r.remarks ?? "",
      });
    }
    rentalIdByKey.set(`${r.dress_name}|${r.customer_name}|${r.rental_date}`, created.id);
  }

  for (const ret of seed.returns) {
    const src = seed.rentals.find((r) => r.id === ret.rental_id);
    if (!src) continue;
    const newRentalId = rentalIdByKey.get(`${src.dress_name}|${src.customer_name}|${src.rental_date}`);
    if (!newRentalId) continue;
    await dbInsertReturn(sb, {
      rental_id: newRentalId,
      actual_return_date: ret.actual_return_date,
      condition: ret.condition,
      remarks: ret.remarks,
    });
  }

  return fetchAll(sb);
}
