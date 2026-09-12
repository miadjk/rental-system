"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/src/store/AuthContext";
import { useRentModal } from "@/src/store/RentModalContext";

const titles: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Dashboard", sub: "Overview of your boutique rentals" },
  "/inventory": { title: "Dress Inventory", sub: "Manage every dress in your collection" },
  "/rentals": { title: "Rental Tracking", sub: "Currently active rentals" },
  "/returns": { title: "Return Tracking", sub: "Active rentals awaiting return" },
  "/history": { title: "Rental History", sub: "Every rental, preserved per dress" },
};

export function Header({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { lock } = useAuth();
  const { openRent } = useRentModal();
  const meta = titles[pathname ?? ""] ?? titles["/dashboard"];

  return (
    <header className="sticky top-0 z-30 border-b border-[#EDE4D9] bg-[#FAF8F5]/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3.5 md:px-8">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="rounded-xl border border-[#CCBEB1] bg-white p-2.5 text-[#664930] lg:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B9A892] sm:block">
            Cho Rental
          </p>
          <h1 className="font-heading truncate text-lg font-bold text-[#664930]">{meta.title}</h1>
        </div>
        <button
          onClick={lock}
          className="hidden rounded-xl border border-[#CCBEB1] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#664930] hover:bg-[#FFF1E3] sm:inline-flex"
        >
          Lock System
        </button>
        <button
          onClick={() => openRent()}
          className="rounded-xl bg-[#664930] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#523a26]"
        >
          + Add Rent
        </button>
      </div>
    </header>
  );
}
