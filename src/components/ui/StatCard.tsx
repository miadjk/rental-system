"use client";
import React from "react";

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "peach" | "green" | "red" | "amber" | "neutral";
}) {
  const dot =
    accent === "green"
      ? "bg-green-500"
      : accent === "red"
        ? "bg-red-500"
        : accent === "amber"
          ? "bg-amber-400"
          : accent === "peach"
            ? "bg-[#997E67]"
            : "bg-[#CCBEB1]";
  return (
    <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-[0_1px_2px_rgba(102,73,48,0.06)]">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#997E67]">
          {label}
        </p>
      </div>
      <p className="font-heading mt-3 text-4xl font-bold text-[#2B2118]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#997E67]">{hint}</p>}
    </div>
  );
}
