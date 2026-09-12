"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/src/store/StoreContext";
import { PageTitle, Card } from "@/src/components/ui/Card";
import { DressStatusBadge } from "@/src/components/ui/StatusBadge";
import { SearchBar, FilterDropdown } from "@/src/components/ui/SearchFilter";
import { EmptyState } from "@/src/components/ui/Table";
import { formatDateShort, peso, isOverdue, isDueToday, normalizeDressName } from "@/src/lib/utils";
import type { Rental } from "@/src/lib/types";

export default function HistoryPage() {
  const { rentals, dresses, findDressByName } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredRentals = useMemo(() => {
    return rentals.filter((r) => {
      const hay = `${r.dress_name} ${r.customer_name}`.toLowerCase();
      if (!hay.includes(q.trim().toLowerCase())) return false;
      if (filter === "All") return true;
      if (filter === "Returned") return r.status === "Returned";
      if (filter === "Rented") return r.status === "Rented";
      if (filter === "Due Today") return r.status === "Rented" && isDueToday(r.expected_return_date);
      if (filter === "Overdue") return r.status === "Rented" && isOverdue(r.expected_return_date);
      return true;
    });
  }, [rentals, q, filter]);

  // Group by normalized dress name so manually typed variants stay together.
  const grouped = useMemo(() => {
    const map = new Map<string, { display: string; list: Rental[] }>();
    for (const r of filteredRentals) {
      const key = normalizeDressName(r.dress_name);
      const entry = map.get(key) ?? { display: r.dress_name.trim(), list: [] };
      entry.list.push(r);
      // Prefer the inventory spelling when available.
      const inv = findDressByName(r.dress_name);
      if (inv) entry.display = inv.dress_name;
      map.set(key, entry);
    }
    // Include inventory dresses with zero rentals when searching by dress name
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      for (const d of dresses) {
        if (d.status === "Archived") continue;
        const key = normalizeDressName(d.dress_name);
        if (d.dress_name.toLowerCase().includes(needle) && !map.has(key)) {
          map.set(key, { display: d.dress_name, list: [] });
        }
      }
    }
    return [...map.entries()].sort((a, b) => a[1].display.localeCompare(b[1].display));
  }, [filteredRentals, dresses, findDressByName, q]);

  return (
    <div className="space-y-5">
      <PageTitle title="Rental History" subtitle={`${rentals.length} rental record(s) · grouped per dress`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar value={q} onChange={setQ} placeholder="Search dress or customer…" />
        </div>
        <FilterDropdown
          value={filter}
          onChange={setFilter}
          options={[
            { value: "All", label: "All records" },
            { value: "Rented", label: "Rented" },
            { value: "Returned", label: "Returned" },
            { value: "Due Today", label: "Due Today" },
            { value: "Overdue", label: "Overdue" },
          ]}
        />
      </div>

      {grouped.length === 0 ? (
        <EmptyState title="No rental history" message="Rentals you record will appear here, grouped by dress." />
      ) : (
        <div className="space-y-3">
          {grouped.map(([key, { display, list }]) => {
            const dress = findDressByName(display);
            const isOpen = expanded === key || q.trim().length > 0;
            const sorted = [...list].sort((a, b) => (a.rental_date < b.rental_date ? 1 : -1));
            return (
              <Card key={key} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : key)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#FFFDF9]"
                >
                  <div>
                    <p className="font-heading font-bold text-[#664930]">
                      {display}
                    </p>
                    <p className="text-xs text-[#997E67]">
                      {list.length} rental{list.length === 1 ? "" : "s"}
                      {dress ? ` · ${peso(dress.rental_price)}` : ""}
                    </p>
                  </div>
                  <span className="text-[#997E67]">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-[#EDE4D9] px-5 py-4">
                    {sorted.length === 0 ? (
                      <p className="text-sm text-[#997E67]">No rentals recorded for this dress yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {sorted.map((r, idx) => (
                          <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#FAF8F5] px-4 py-3 text-sm">
                            <div>
                              <p className="font-semibold">
                                Rental #{sorted.length - idx} — {r.customer_name}
                                <span className="ml-2 font-normal text-[#997E67]">
                                  {formatDateShort(r.rental_date)} → {formatDateShort(r.status === "Returned" ? (r.actual_return_date ?? r.expected_return_date) : r.expected_return_date)}
                                </span>
                              </p>
                              <p className="text-xs text-[#997E67]">
                                Fee {peso(r.rental_fee)}
                                {r.condition ? ` · ${r.condition}` : ""}
                                {r.remarks ? ` · ${r.remarks}` : ""}
                              </p>
                            </div>
                            <DressStatusBadge
                              status={
                                r.status === "Returned"
                                  ? "Returned"
                                  : isOverdue(r.expected_return_date)
                                    ? "Overdue"
                                    : isDueToday(r.expected_return_date)
                                      ? "Due Today"
                                      : "Rented"
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
