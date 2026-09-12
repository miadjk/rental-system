"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { FormInput, PrimaryButton, SecondaryButton } from "@/src/components/ui/Form";
import { useStore } from "@/src/store/StoreContext";
import { useToast } from "@/src/components/ui/Toast";
import { normalizeDressName, todayISO } from "@/src/lib/utils";

export function AddRentModal({
  open,
  onClose,
  presetDressName,
}: {
  open: boolean;
  onClose: () => void;
  presetDressName?: string;
}) {
  const { findDressByName, activeRentalForName, addRentalByName } = useStore();
  const { notify } = useToast();

  const [dressName, setDressName] = useState("");
  const [customer, setCustomer] = useState("");
  const [rentalDate, setRentalDate] = useState(todayISO());
  const [returnDate, setReturnDate] = useState(todayISO());
  const [fee, setFee] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingUnknown, setPendingUnknown] = useState(false);

  useEffect(() => {
    if (open) {
      setDressName(presetDressName ?? "");
      setCustomer("");
      setRentalDate(todayISO());
      setReturnDate(todayISO());
      setFee("");
      setError(null);
      setPendingUnknown(false);
    }
  }, [open, presetDressName]);

  const validate = (): string | null => {
    if (!normalizeDressName(dressName)) return "Enter a dress name.";
    if (!customer.trim()) return "Enter a customer name.";
    if (!rentalDate || !returnDate) return "Select rental and return dates.";
    if (returnDate < rentalDate) return "Return date cannot be before rental date.";
    const feeNum = Number(fee);
    if (fee === "" || isNaN(feeNum) || feeNum < 0) return "Enter a valid rental fee.";
    return null;
  };

  const buildInput = (addToInventory: boolean) => ({
    dress_name: dressName,
    customer_name: customer,
    rental_date: rentalDate,
    expected_return_date: returnDate,
    rental_fee: Number(fee),
    addToInventory,
  });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    // Prevent double rental — case-insensitive, trimmed.
    const clash = activeRentalForName(dressName);
    if (clash) {
      setError(
        "This dress is currently rented. Please check the rental records before creating a new rental."
      );
      return;
    }

    // Unknown dress → confirm instead of silently creating inconsistent records.
    if (!findDressByName(dressName)) {
      setPendingUnknown(true);
      return;
    }

    try {
      addRentalByName(buildInput(false));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save rental.");
      return;
    }
    notify("Rental recorded successfully.");
    onClose();
  };

  const confirmAddToInventory = () => {
    try {
      addRentalByName(buildInput(true));
    } catch (err) {
      setPendingUnknown(false);
      setError(err instanceof Error ? err.message : "Could not save rental.");
      return;
    }
    notify("Dress added to inventory. Rental recorded successfully.");
    onClose();
  };

  const confirmStandalone = () => {
    try {
      addRentalByName(buildInput(false));
    } catch (err) {
      setPendingUnknown(false);
      setError(err instanceof Error ? err.message : "Could not save rental.");
      return;
    }
    notify("Rental recorded successfully.");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Rent" subtitle="Type the details — fast manual entry, no lists">
      {pendingUnknown ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#FFDBBB] bg-[#FFFDF9] p-4">
            <p className="font-heading text-sm font-bold text-[#664930]">
              Dress not in inventory
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#6d5b4c]">
              This dress is not currently in your inventory. Would you like to
              add it to the inventory?
            </p>
            <p className="mt-2 rounded-xl bg-white px-3 py-2 text-sm">
              <span className="text-[#997E67]">Dress:</span>{" "}
              <strong>{dressName.trim()}</strong>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <SecondaryButton type="button" onClick={() => setPendingUnknown(false)}>
              Back
            </SecondaryButton>
            <SecondaryButton type="button" onClick={confirmStandalone}>
              Continue Rental
            </SecondaryButton>
            <PrimaryButton type="button" onClick={confirmAddToInventory}>
              Add to Inventory
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <form onSubmit={save} className="space-y-4">
          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-[#664930]">
              Dress Details
            </h3>
            <div className="mt-3">
              <FormInput
                label="Dress Name"
                value={dressName}
                onChange={(e) => setDressName(e.target.value)}
                placeholder="e.g. Black Glitz Dress"
                required
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-[#664930]">
              Customer Details
            </h3>
            <div className="mt-3">
              <FormInput
                label="Customer Name"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Maria Santos"
                required
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-[#664930]">
              Rental Details
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <FormInput label="Rental Date" type="date" value={rentalDate} onChange={(e) => setRentalDate(e.target.value)} required />
              <FormInput label="Return Date" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />
            </div>
            <div className="mt-4">
              <FormInput label="Rental Fee (₱)" type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} placeholder="350" required />
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton type="submit">Save Rental</PrimaryButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
