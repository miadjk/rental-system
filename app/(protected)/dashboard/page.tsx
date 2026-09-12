"use client";

import Link from "next/link";
import { useStore } from "@/src/store/StoreContext";
import { StatCard } from "@/src/components/ui/StatCard";
import { DressStatusBadge } from "@/src/components/ui/StatusBadge";
import { Card, PageTitle } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/Table";
import { formatDateShort, peso, daysOverdue } from "@/src/lib/utils";
import { useRentModal } from "@/src/store/RentModalContext";

export default function DashboardPage() {
  const { ready, totalDresses, availableCount, rentedCount, dueToday, overdue, activeRentals } = useStore();
  const { openRent } = useRentModal();

  if (!ready) return <p className="text-sm text-[#997E67]">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageTitle title="Good day, Boutique Owner" subtitle="Here is what's happening with your dresses today." />
        <button onClick={() => openRent()} className="rounded-xl bg-[#664930] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#523a26]">
          + Add Rent
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 md:gap-4">
        <StatCard label="Total Dresses" value={totalDresses} hint="Qty recorded" accent="peach" />
        <StatCard label="Available" value={availableCount} hint="Ready to rent" accent="green" />
        <StatCard label="Currently Rented" value={rentedCount} hint="Out now" accent="red" />
        <StatCard label="Due Today" value={dueToday.length} hint="Return expected" accent="amber" />
        <StatCard label="Overdue" value={overdue.length} hint="Needs follow-up" accent="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-[#664930]">Due Today</h2>
            <Link href="/returns" className="text-xs font-semibold text-[#997E67] hover:text-[#664930]">View all →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {dueToday.length === 0 && (
              <p className="rounded-xl bg-[#FAF8F5] px-4 py-6 text-center text-sm text-[#997E67]">
                Nothing due today. Enjoy the calm.
              </p>
            )}
            {dueToday.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-[#EDE4D9] bg-[#FFFDF9] px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#2B2118]">{r.dress_name}</p>
                  <p className="text-xs text-[#997E67]">{r.customer_name} · Return today · {peso(r.rental_fee)}</p>
                </div>
                <DressStatusBadge status="Due Today" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-[#664930]">Overdue</h2>
            <Link href="/returns" className="text-xs font-semibold text-[#997E67] hover:text-[#664930]">View all →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {overdue.length === 0 && (
              <p className="rounded-xl bg-[#FAF8F5] px-4 py-6 text-center text-sm text-[#997E67]">
                No overdue rentals. Beautifully managed.
              </p>
            )}
            {overdue.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/40 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#2B2118]">{r.dress_name}</p>
                  <p className="text-xs text-red-700">{r.customer_name} · {daysOverdue(r.expected_return_date)} day(s) overdue</p>
                </div>
                <DressStatusBadge status="Overdue" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-[#664930]">
            Active Rentals ({activeRentals.length})
          </h2>
          <Link href="/rentals" className="text-xs font-semibold text-[#997E67] hover:text-[#664930]">Open tracking →</Link>
        </div>
        {activeRentals.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No active rentals" message="No dresses are currently being rented." action={<button onClick={() => openRent()} className="rounded-xl bg-[#664930] px-4 py-2.5 text-sm font-semibold text-white">+ Add Rent</button>} />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {activeRentals.slice(0, 4).map((r) => (
              <div key={r.id} className="rounded-2xl border border-[#EDE4D9] bg-[#FAF8F5] p-4">
                <p className="font-heading text-sm font-bold uppercase text-[#664930]">{r.dress_name}</p>
                <p className="mt-1 text-xs text-[#997E67]">Customer: <span className="font-semibold text-[#2B2118]">{r.customer_name}</span></p>
                <p className="text-xs text-[#997E67]">Rental: {formatDateShort(r.rental_date)} → {formatDateShort(r.expected_return_date)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{peso(r.rental_fee)}</span>
                  <DressStatusBadge status="Rented" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
