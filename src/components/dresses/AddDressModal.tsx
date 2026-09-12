"use client";

import React, { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { FormInput, SelectInput, PrimaryButton, SecondaryButton } from "@/src/components/ui/Form";
import { useStore } from "@/src/store/StoreContext";
import { useToast } from "@/src/components/ui/Toast";
import { todayISO } from "@/src/lib/utils";

export function AddDressModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addDress } = useStore();
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState("Available");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setQty("1");
    setPrice("");
    setDate(todayISO());
    setStatus("Available");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return notify("Enter a dress name.", "error");
    const q = Math.max(1, parseInt(qty || "1", 10));
    const p = Math.max(0, Number(price || 0));
    setSaving(true);
    try {
      await addDress({
        dress_name: name,
        quantity: isNaN(q) ? 1 : q,
        rental_price: isNaN(p) ? 0 : p,
        date_added: date || todayISO(),
        status: status as "Available" | "Rented" | "Unavailable",
      });
    } catch (err) {
      setSaving(false);
      return notify(err instanceof Error ? err.message : "Could not save dress.", "error");
    }
    setSaving(false);
    notify("Dress added successfully.");
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Dress" subtitle="Create a new inventory record">
      <form onSubmit={save} className="space-y-4">
        <FormInput label="Dress Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Valentina Dress" required />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Quantity" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} required />
          <FormInput label="Rental Price (₱)" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="350" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Date Added" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <SelectInput label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </SelectInput>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save Dress"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
