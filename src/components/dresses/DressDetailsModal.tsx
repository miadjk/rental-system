"use client";

import React from "react";
import { Modal } from "@/src/components/ui/Modal";
import { DressStatusBadge } from "@/src/components/ui/StatusBadge";
import { useStore } from "@/src/store/StoreContext";
import { formatDateLong, peso, daysOverdue, isDueToday, isOverdue } from "@/src/lib/utils";
import type { Dress } from "@/src/lib/types";

export function DressDetailsModal({
  dress,
  onClose,
}: {
  dress: Dress | null;
  onClose: () => void;
}) {
  const { rentalsForDress, activeRentalForDress } = useStore();
  if (!dress) return null;
  const history = rentalsForDress(dress.id);
  const current = activeRentalForDress(dress.id);

  return (
    <Modal open={!!dress} onClose={onClose} title={dress.dress_name} subtitle="Dress details & rental history" wide>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#EDE4D9] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#997E67]">Rental Price</p>
          <p className="font-heading mt-1 text-xl font-bold">{peso(dress.rental_price)}</p>
        </div>
        <div className="rounded-2xl border border-[#EDE4D9] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#997E67]">Quantity</p>
          <p className="font-heading mt-1 text-xl font-bold">{dress.quantity}</p>
        </div>
        <div className="rounded-2xl border border-[#EDE4D9] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#997E67]">Date Added</p>
          <p className="mt-1 text-sm font-semibold">{formatDateLong(dress.date_added)}</p>
        </div>
        <div className="rounded-2xl border border-[#EDE4D9] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#997E67]">Status</p>
          <div className="mt-2"><DressStatusBadge status={dress.status} /></div>
        </div>
      </div>

      {current && (
        <div className="mt-4 rounded-2xl border border-[#FFDBBB] bg-[#FFFDF9] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#997E67]">Current Rental</p>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <p><span className="text-[#997E67]">Customer:</span> <strong>{current.customer_name}</strong></p>
            <p><span className="text-[#997E67]">Fee:</span> <strong>{peso(current.rental_fee)}</strong></p>
            <p><span className="text-[#997E67]">Rental Date:</span> {formatDateLong(current.rental_date)}</p>
            <p><span className="text-[#997E67]">Expected Return:</span> {formatDateLong(current.expected_return_date)}</p>
          </div>
          {isOverdue(current.expected_return_date) && (
            <p className="mt-2 text-sm font-semibold text-red-600">
              {daysOverdue(current.expected_return_date)} day(s) overdue
            </p>
          )}
          {isDueToday(current.expected_return_date) && (
            <p className="mt-2 text-sm font-semibold text-amber-600">Due today — return expected</p>
          )}
        </div>
      )}

      <h3 className="font-heading mt-6 text-sm font-bold uppercase tracking-widest text-[#664930]">
        Rental History ({history.length})
      </h3>
      {history.length === 0 ? (
        <p className="mt-2 text-sm text-[#997E67]">No rentals recorded for this dress yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-[#EDE4D9] bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#EDE4D9] bg-[#FAF8F5]">
                {["Customer", "Rental", "Return", "Fee", "Status"].map((c) => (
                  <th key={c} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#997E67]">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E8DD]">
              {history.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2.5 font-medium">{r.customer_name}</td>
                  <td className="px-4 py-2.5 text-[#6d5b4c]">{formatDateLong(r.rental_date)}</td>
                  <td className="px-4 py-2.5 text-[#6d5b4c]">{formatDateLong(r.status === "Returned" ? (r.actual_return_date ?? r.expected_return_date) : r.expected_return_date)}</td>
                  <td className="px-4 py-2.5">{peso(r.rental_fee)}</td>
                  <td className="px-4 py-2.5">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
