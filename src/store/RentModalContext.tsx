"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface RentModalState {
  open: boolean;
  /** Optional dress name prefill (e.g. from inventory "Rent"). Free text — always editable. */
  openRent: (presetDressName?: string) => void;
  closeRent: () => void;
  presetDressName?: string;
}

const Ctx = createContext<RentModalState>({
  open: false,
  openRent: () => {},
  closeRent: () => {},
});

export function RentModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [presetDressName, setPresetDressName] = useState<string | undefined>(undefined);

  const openRent = useCallback((name?: string) => {
    setPresetDressName(name);
    setOpen(true);
  }, []);
  const closeRent = useCallback(() => setOpen(false), []);

  return (
    <Ctx.Provider value={{ open, openRent, closeRent, presetDressName }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRentModal() {
  return useContext(Ctx);
}
