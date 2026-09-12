"use client";
import React from "react";

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CCBEB1] bg-[#FFFDF9] px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1E3] text-[#997E67]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 8h12l-1.2 8.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      </div>
      <h3 className="font-heading mt-4 text-base font-bold text-[#664930]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#997E67]">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  renderRow,
  minWidth = 720,
}: {
  columns: string[];
  rows: T[];
  renderRow: (row: T, i: number) => React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#EDE4D9] bg-white">
      <table className="w-full border-collapse text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-[#EDE4D9] bg-[#FAF8F5]">
            {columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#997E67]"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1E8DD]">
          {rows.map((r, i) => renderRow(r, i))}
        </tbody>
      </table>
    </div>
  );
}
