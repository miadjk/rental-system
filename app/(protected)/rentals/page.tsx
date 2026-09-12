"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/src/store/StoreContext";
import { PageTitle } from "@/src/components/ui/Card";
import { DressStatusBadge } from "@/src/components/ui/StatusBadge";
import { SearchBar, FilterDropdown } from "@/src/components/ui/SearchFilter";
import { DataTable, EmptyState } from "@/src/components/ui/Table";
import { ReturnModal } from "@/src/components/rentals/ReturnModal";
import { useRentModal } from "@/src/store/RentModalContext";
import { formatDateShort, peso, daysOverdue, isDueToday, isOverdue } from "@/src/lib/utils";
import type { Rental } from "@/src/lib/types";

function displayStatus(r: Rental): "Rented" | "Due Today" | "Overdue" {
  if (isOverdue(r.expected_return_date)) return "Overdue";
  if (isDueToday(r.expected_return_date)) return "Due Today";
  return "Rented";
}

export default function RentalsPage() {
  const { activeRentals } = useStore();
  const { openRent } = useRentModal();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [returning, setReturning] = useState<Rental | null>(null);

  const filtered = useMemo(() => {
    return activeRentals.filter((r) => {
      const hay = `${r.dress_name} ${r.customer_name}`.toLowerCase();
      const matchQ = hay.includes(q.trim().toLowerCase());
      const st = displayStatus(r);
      const matchF = filter === "All" || st === filter;
      return matchQ && matchF;
    });
  }, [activeRentals, q, filter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageTitle title="Rental Tracking" subtitle={`${activeRentals.length} active rental(s)`} />
        <button onClick={() => openRent()} className="rounded-xl bg-[#664930] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#523a26]">
          + Add Rent
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar value={q} onChange={setQ} placeholder="Search dress or customer…" />
        </div>
        <FilterDropdown
          value={filter}
          onChange={setFilter}
          options={[
            { value: "All", label: "All active" },
            { value: "Rented", label: "Rented" },
            { value: "Due Today", label: "Due Today" },
            { value: "Overdue", label: "Overdue" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No active rentals"
          message="No dresses are currently being rented."
          action={<button onClick={() => openRent()} className="rounded-xl bg-[#664930] px-4 py-2.5 text-sm font-semibold text-white">+ Add Rent</button>}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTable
              columns={["Dress", "Customer", "Rental Date", "Expected Return", "Fee", "Status", "Action"]}
              rows={filtered}
              renderRow={(r: Rental) => (
                <tr key={r.id} className="hover:bg-[#FFFDF9]">
                  <td className="px-4 py-3 font-semibold text-[#664930]">{r.dress_name}</td>
                  <td className="px-4 py-3">{r.customer_name}</td>
                  <td className="px-4 py-3">{formatDateShort(r.rental_date)}</td>
                  <td className="px-4 py-3">
                    {formatDateShort(r.expected_return_date)}
                    {isOverdue(r.expected_return_date) && (
                      <span className="block text-xs font-semibold text-red-600">
                        {daysOverdue(r.expected_return_date)}d overdue
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{peso(r.rental_fee)}</td>
                  <td className="px-4 py-3"><DressStatusBadge status={displayStatus(r)} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setReturning(r)} className="rounded-lg bg-[#664930] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#523a26]">
                      Return
                    </button>
                  </td>
                </tr>
              )}
            />
          </div>
          <div className="grid gap-3 md:hidden">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-2xl border border-[#EDE4D9] bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-heading text-sm font-bold uppercase text-[#664930]">
                    {r.dress_name}
                  </p>
                  <DressStatusBadge status={displayStatus(r)} />
                </div>
                <div className="mt-2 space-y-0.5 text-sm text-[#6d5b4c]">
                  <p>Customer: <strong className="text-[#2B2118]">{r.customer_name}</strong></p>
                  <p>Rental Date: {formatDateShort(r.rental_date)}</p>
                  <p>Return Date: {formatDateShort(r.expected_return_date)}</p>
                  <p>Rental Fee: <strong className="text-[#2B2118]">{peso(r.rental_fee)}</strong></p>
                  {isOverdue(r.expected_return_date) && (
                    <p className="font-semibold text-red-600">{daysOverdue(r.expected_return_date)} days overdue</p>
                  )}
                </div>
                <button onClick={() => setReturning(r)} className="mt-3 w-full rounded-xl bg-[#664930] py-2.5 text-sm font-semibold text-white">
                  Return
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <ReturnModal rental={returning} onClose={() => setReturning(null)} />
    </div>
  );
}
