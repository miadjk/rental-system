"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { FormInput, SelectInput, TextArea, PrimaryButton, SecondaryButton } from "@/src/components/ui/Form";
import { useStore } from "@/src/store/StoreContext";
import { useToast } from "@/src/components/ui/Toast";
import { formatDateLong, peso, todayISO } from "@/src/lib/utils";
import type { Rental } from "@/src/lib/types";

export function ReturnModal({
  rental,
  onClose,
}: {
  rental: Rental | null;
  onClose: () => void;
}) {
  const { dressById, completeReturn } = useStore();
  const { notify } = useToast();
  const [actualDate, setActualDate] = useState(todayISO());
  const [condition, setCondition] = useState<"Good" | "Minor Damage" | "Damaged">("Good");
  const [remarks, setRemarks] = useState("");
  const [markUnavailable, setMarkUnavailable] = useState(false);

  useEffect(() => {
    if (rental) {
      setActualDate(todayISO());
      setCondition("Good");
      setRemarks("");
      setMarkUnavailable(false);
    }
  }, [rental]);

  if (!rental) return null;
  const linked = rental.dress_id ? dressById(rental.dress_id) : undefined;
  const dressName = rental.dress_name || linked?.dress_name || "Unknown dress";

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await completeReturn({
        rental_id: rental.id,
        actual_return_date: actualDate || todayISO(),
        condition,
        remarks,
        markUnavailable: markUnavailable || condition === "Damaged",
      });
    } catch (err) {
      return notify(err instanceof Error ? err.message : "Could not record return.", "error");
    }
    notify("Dress returned successfully.");
    onClose();
  };

  return (
    <Modal open={!!rental} onClose={onClose} title="Return Dress" subtitle={`${dressName} — ${rental.customer_name}`}>
      <div className="rounded-2xl border border-[#EDE4D9] bg-white p-4 text-sm">
        <div className="grid gap-1.5 sm:grid-cols-2">
          <p><span className="text-[#997E67]">Dress:</span> <strong>{dressName}</strong></p>
          <p><span className="text-[#997E67]">Customer:</span> <strong>{rental.customer_name}</strong></p>
          <p><span className="text-[#997E67]">Expected Return:</span> {formatDateLong(rental.expected_return_date)}</p>
          <p><span className="text-[#997E67]">Fee:</span> {peso(rental.rental_fee)}</p>
        </div>
      </div>
      <form onSubmit={confirm} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Actual Return Date" type="date" value={actualDate} onChange={(e) => setActualDate(e.target.value)} required />
          <SelectInput label="Condition" value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)}>
            <option value="Good">Good</option>
            <option value="Minor Damage">Minor Damage</option>
            <option value="Damaged">Damaged</option>
          </SelectInput>
        </div>
        <TextArea label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes…" rows={3} />
        <label className="flex items-center gap-2 text-sm text-[#6d5b4c]">
          <input type="checkbox" checked={markUnavailable} onChange={(e) => setMarkUnavailable(e.target.checked)} className="h-4 w-4 accent-[#664930]" />
          Mark dress as Unavailable after return (e.g. needs repair)
        </label>
        <div className="flex justify-end gap-2">
          <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit">Confirm Return</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
