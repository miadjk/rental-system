"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/src/store/StoreContext";
import { PageTitle } from "@/src/components/ui/Card";
import { DressStatusBadge } from "@/src/components/ui/StatusBadge";
import { SearchBar, FilterDropdown } from "@/src/components/ui/SearchFilter";
import { DataTable, EmptyState } from "@/src/components/ui/Table";
import { ConfirmDialog } from "@/src/components/ui/Modal";
import { AddDressModal } from "@/src/components/dresses/AddDressModal";
import { EditDressModal } from "@/src/components/dresses/EditDressModal";
import { DressDetailsModal } from "@/src/components/dresses/DressDetailsModal";
import { useToast } from "@/src/components/ui/Toast";
import { useRentModal } from "@/src/store/RentModalContext";
import { formatDateShort, peso } from "@/src/lib/utils";
import type { Dress } from "@/src/lib/types";

export default function InventoryPage() {
  const { dresses, archiveDress, activeRentalForDress } = useStore();
  const { notify } = useToast();
  const { openRent } = useRentModal();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Dress | null>(null);
  const [viewing, setViewing] = useState<Dress | null>(null);
  const [archiving, setArchiving] = useState<Dress | null>(null);

  const visible = useMemo(
    () => dresses.filter((d) => d.status !== "Archived"),
    [dresses]
  );

  const filtered = useMemo(() => {
    return visible.filter((d) => {
      const matchQ = d.dress_name.toLowerCase().includes(q.trim().toLowerCase());
      const matchS = status === "All" || d.status === status;
      return matchQ && matchS;
    });
  }, [visible, q, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageTitle title="Dress Inventory" subtitle={`${visible.length} styles · history preserved on archive`} />
        <button onClick={() => setShowAdd(true)} className="rounded-xl bg-[#664930] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#523a26]">
          + Add Dress
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar value={q} onChange={setQ} placeholder="Search dress…" />
        </div>
        <FilterDropdown
          value={status}
          onChange={setStatus}
          options={[
            { value: "All", label: "All statuses" },
            { value: "Available", label: "Available" },
            { value: "Rented", label: "Rented" },
            { value: "Unavailable", label: "Unavailable" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={visible.length === 0 ? "No dresses yet" : "No matches found"}
          message={visible.length === 0 ? "Add your first dress to start tracking your rental inventory." : "Try a different search or filter."}
          action={visible.length === 0 ? <button onClick={() => setShowAdd(true)} className="rounded-xl bg-[#664930] px-4 py-2.5 text-sm font-semibold text-white">+ Add Dress</button> : undefined}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <DataTable
              columns={["Dress Name", "Qty", "Price", "Date Added", "Status", "Action"]}
              rows={filtered}
              renderRow={(d: Dress) => (
                <tr key={d.id} className="hover:bg-[#FFFDF9]">
                  <td className="px-4 py-3">
                    <button onClick={() => setViewing(d)} className="font-semibold text-[#664930] hover:underline">
                      {d.dress_name}
                    </button>
                  </td>
                  <td className="px-4 py-3">{d.quantity}</td>
                  <td className="px-4 py-3">{peso(d.rental_price)}</td>
                  <td className="px-4 py-3 text-[#6d5b4c]">{formatDateShort(d.date_added)}</td>
                  <td className="px-4 py-3"><DressStatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewing(d)} className="rounded-lg border border-[#CCBEB1] px-2.5 py-1.5 text-xs font-semibold text-[#664930] hover:bg-[#FFF1E3]">View</button>
                      <button onClick={() => setEditing(d)} className="rounded-lg border border-[#CCBEB1] px-2.5 py-1.5 text-xs font-semibold text-[#664930] hover:bg-[#FFF1E3]">Edit</button>
                      {d.status === "Available" || d.status === "Unavailable" ? (
                        <button onClick={() => openRent(d.dress_name)} className="rounded-lg bg-[#664930] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#523a26]">Rent</button>
                      ) : null}
                      <button onClick={() => setArchiving(d)} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Archive</button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {filtered.map((d) => (
              <div key={d.id} className="rounded-2xl border border-[#EDE4D9] bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <button onClick={() => setViewing(d)} className="text-left font-bold text-[#664930]">
                    {d.dress_name}
                  </button>
                  <DressStatusBadge status={d.status} />
                </div>
                <p className="mt-1 text-sm text-[#997E67]">
                  Qty {d.quantity} · {peso(d.rental_price)} · {formatDateShort(d.date_added)}
                </p>
                {activeRentalForDress(d.id) && (
                  <p className="mt-1 text-xs text-red-600">Rented to {activeRentalForDress(d.id)?.customer_name}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setViewing(d)} className="flex-1 rounded-xl border border-[#CCBEB1] py-2 text-xs font-semibold text-[#664930]">View</button>
                  <button onClick={() => setEditing(d)} className="flex-1 rounded-xl border border-[#CCBEB1] py-2 text-xs font-semibold text-[#664930]">Edit</button>
                  {(d.status === "Available" || d.status === "Unavailable") && (
                    <button onClick={() => openRent(d.dress_name)} className="flex-1 rounded-xl bg-[#664930] py-2 text-xs font-semibold text-white">Rent</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AddDressModal open={showAdd} onClose={() => setShowAdd(false)} />
      <EditDressModal dress={editing} onClose={() => setEditing(null)} />
      <DressDetailsModal dress={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={!!archiving}
        onClose={() => setArchiving(null)}
        title="Archive dress?"
        message={`Are you sure you want to archive "${archiving?.dress_name}"? Rental history will be preserved and the dress will be hidden from active lists.`}
        confirmLabel="Archive"
        onConfirm={() => {
          if (archiving) {
            archiveDress(archiving.id)
              .then(() => notify("Dress archived. History preserved."))
              .catch((err) =>
                notify(err instanceof Error ? err.message : "Could not archive dress.", "error")
              );
          }
        }}
      />
    </div>
  );
}
