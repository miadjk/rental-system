"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/src/store/AuthContext";
import { useStore } from "@/src/store/StoreContext";
import { LockScreen } from "@/src/components/auth/LockScreen";
import { AddRentModal } from "@/src/components/rentals/AddRentModal";
import { useRentModal } from "@/src/store/RentModalContext";

function DataSourceBanner() {
  const { dataSource, cloudError } = useStore();
  if (cloudError) {
    return (
      <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
        Supabase unreachable ({cloudError}) — showing local data. Check your connection and refresh.
      </p>
    );
  }
  if (dataSource === "cloud") {
    return (
      <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Connected to Supabase
      </p>
    );
  }
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { authed, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open, closeRent, presetDressName } = useRentModal();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#FAF8F5]">
        <p className="font-heading text-sm text-[#997E67]">Loading boutique…</p>
      </div>
    );
  }

  if (!authed) return <LockScreen />;

  return (
    <div className="flex min-h-dvh bg-[#FAF8F5]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
          <DataSourceBanner />
          {children}
        </main>
        <footer className="px-4 pb-6 text-center text-xs text-[#B9A892] md:px-8">
          Cho Rental · Minimal boutique tracking · {new Date().getFullYear()}
        </footer>
      </div>
      <AddRentModal open={open} onClose={closeRent} presetDressName={presetDressName} />
    </div>
  );
}
