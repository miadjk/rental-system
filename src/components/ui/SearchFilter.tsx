"use client";
import React from "react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#997E67]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#CCBEB1] bg-white py-2.5 pl-9 pr-3 text-sm text-[#2B2118] placeholder:text-[#B9A892] focus:border-[#997E67] focus:outline-none focus:ring-2 focus:ring-[#FFDBBB]"
      />
    </div>
  );
}

export function FilterDropdown({
  value,
  onChange,
  options,
  label = "Filter",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="hidden text-xs font-medium text-[#997E67] sm:inline">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[#CCBEB1] bg-white px-3 py-2.5 text-sm text-[#2B2118] focus:border-[#997E67] focus:outline-none focus:ring-2 focus:ring-[#FFDBBB]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
