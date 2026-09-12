"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/src/store/StoreContext";
import { PageTitle } from "@/src/components/ui/Card";
import { DressStatusBadge } from "@/src/components/ui/StatusBadge";
import { SearchBar } from "@/src/components/ui/SearchFilter";
import { DataTable, EmptyState } from "@/src/components/ui/Table";
import { ReturnModal } from "@/src/components/rentals/ReturnModal";
import { formatDateShort, peso, daysOverdue, isOverdue, isDueToday } from "@/src/lib/utils";
import type { Rental } from "@/src/lib/types";

export default function ReturnsPage() {
  const { activeRentals } = useStore();
  const [q, setQ] = useState("");
  const [returning, setReturning] = useState<Rental | null>(null);

  const filtered = useMemo(() => {
    return activeRentals
      .filter((r) => {
        return `${r.dress_name} ${r.customer_name}`.toLowerCase().includes(q.trim().toLowerCase());
      })
      .sort((a, b) => (a.expected_return_date < b.expected_return_date ? -1 : 1));
  }, [activeRentals, q]);

  return (
    <div className="space-y-5">
      <PageTitle title="Return Tracking" subtitle="Active rentals awaiting return, soonest first" />
      <SearchBar value={q} onChange={setQ} placeholder="Search dress or customer…" />

      {filtered.length === 0 ? (
        <EmptyState title="All returned" message="No active rentals awaiting return." />
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
                      <span className="block text-xs font-semibold text-red-600">{daysOverdue(r.expected_return_date)}d overdue</span>
                    )}
                    {isDueToday(r.expected_return_date) && (
                      <span className="block text-xs font-semibold text-amber-600">Due today</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{peso(r.rental_fee)}</td>
                  <td className="px-4 py-3">
                    <DressStatusBadge status={isOverdue(r.expected_return_date) ? "Overdue" : isDueToday(r.expected_return_date) ? "Due Today" : "Rented"} />
                  </td>
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
                  <div>
                    <p className="font-bold text-[#664930]">{r.dress_name}</p>
                    <p className="text-sm text-[#997E67]">{r.customer_name} · {formatDateShort(r.expected_return_date)}</p>
                  </div>
                  <DressStatusBadge status={isOverdue(r.expected_return_date) ? "Overdue" : isDueToday(r.expected_return_date) ? "Due Today" : "Rented"} />
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
