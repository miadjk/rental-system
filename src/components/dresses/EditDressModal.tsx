"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { FormInput, SelectInput, PrimaryButton, SecondaryButton } from "@/src/components/ui/Form";
import { useStore } from "@/src/store/StoreContext";
import { useToast } from "@/src/components/ui/Toast";
import type { Dress } from "@/src/lib/types";

export function EditDressModal({
  dress,
  onClose,
}: {
  dress: Dress | null;
  onClose: () => void;
}) {
  const { updateDress } = useStore();
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<Dress["status"]>("Available");

  useEffect(() => {
    if (dress) {
      setName(dress.dress_name);
      setQty(String(dress.quantity));
      setPrice(String(dress.rental_price));
      setDate(dress.date_added);
      setStatus(dress.status);
    }
  }, [dress]);

  if (!dress) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent marking Rented manually if no active rental? Allow but keep simple: only Available/Unavailable editable, Rented locked.
    updateDress(dress.id, {
      dress_name: name.trim(),
      quantity: Math.max(1, parseInt(qty || "1", 10)),
      rental_price: Number(price || 0),
      date_added: date,
      status: status === "Rented" ? dress.status : status,
    });
    notify("Dress updated successfully.");
    onClose();
  };

  return (
    <Modal open={!!dress} onClose={onClose} title="Edit Dress" subtitle={dress.dress_name}>
      <form onSubmit={save} className="space-y-4">
        <FormInput label="Dress Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Quantity" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} required />
          <FormInput label="Rental Price (₱)" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Date Added" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <SelectInput label="Status" value={status} onChange={(e) => setStatus(e.target.value as Dress["status"])}>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
            <option value="Rented" disabled>
              Rented (set by rentals)
            </option>
          </SelectInput>
        </div>
        {dress.status === "Rented" && (
          <p className="rounded-xl bg-[#FFF1E3] px-3 py-2 text-xs text-[#664930]">
            This dress is currently rented — status is managed by the rental workflow.
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit">Save Changes</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
