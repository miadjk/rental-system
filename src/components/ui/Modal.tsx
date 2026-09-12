"use client";
import React, { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="animate-fade-in absolute inset-0 bg-[#2B2118]/40" onClick={onClose} />
      <div
        className={`animate-slide-up relative w-full rounded-t-3xl border border-[#EDE4D9] bg-[#FAF8F5] shadow-xl sm:rounded-3xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        } max-h-[92dvh] overflow-y-auto`}
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-[#EDE4D9] bg-[#FAF8F5]/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#664930]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-[#997E67]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-[#CCBEB1] bg-white p-2 text-[#997E67] hover:bg-[#FFF1E3]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm leading-relaxed text-[#5b4a3c]">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border border-[#CCBEB1] bg-white px-4 py-2.5 text-sm font-semibold text-[#664930] hover:bg-[#FFF1E3]"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="rounded-xl bg-[#664930] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#523a26]"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
