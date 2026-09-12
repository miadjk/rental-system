"use client";
import React from "react";

type Tone = "green" | "red" | "gray" | "amber" | "peach" | "brown";

const styles: Record<Tone, string> = {
  green: "bg-green-50 text-green-700 border-green-200",
  red: "bg-red-50 text-red-700 border-red-200",
  gray: "bg-stone-100 text-stone-600 border-stone-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  peach: "bg-[#FFF1E3] text-[#664930] border-[#FFDBBB]",
  brown: "bg-[#664930] text-white border-[#664930]",
};

export function StatusBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[tone]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "green" ? "bg-green-500" : tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : tone === "gray" ? "bg-stone-400" : "bg-[#997E67]"
        }`}
      />
      {children}
    </span>
  );
}

export function DressStatusBadge({ status }: { status: string }) {
  if (status === "Available") return <StatusBadge tone="green">Available</StatusBadge>;
  if (status === "Rented") return <StatusBadge tone="red">Rented</StatusBadge>;
  if (status === "Unavailable") return <StatusBadge tone="gray">Unavailable</StatusBadge>;
  if (status === "Archived") return <StatusBadge tone="gray">Archived</StatusBadge>;
  if (status === "Returned") return <StatusBadge tone="green">Returned</StatusBadge>;
  if (status === "Due Today") return <StatusBadge tone="amber">Due Today</StatusBadge>;
  if (status === "Overdue") return <StatusBadge tone="red">Overdue</StatusBadge>;
  return <StatusBadge tone="peach">{status}</StatusBadge>;
}
