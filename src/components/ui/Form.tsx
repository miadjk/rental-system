"use client";
import React from "react";

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const { label, hint, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#997E67]">
        {label}
      </span>
      <input
        {...rest}
        className="w-full rounded-xl border border-[#CCBEB1] bg-white px-3 py-2.5 text-sm text-[#2B2118] placeholder:text-[#B9A892] focus:border-[#997E67] focus:outline-none focus:ring-2 focus:ring-[#FFDBBB] disabled:bg-stone-50"
      />
      {hint && <span className="mt-1 block text-xs text-[#997E67]">{hint}</span>}
    </label>
  );
}

export function SelectInput({
  label,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#997E67]">
        {label}
      </span>
      <select
        {...rest}
        className="w-full rounded-xl border border-[#CCBEB1] bg-white px-3 py-2.5 text-sm text-[#2B2118] focus:border-[#997E67] focus:outline-none focus:ring-2 focus:ring-[#FFDBBB]"
      >
        {children}
      </select>
    </label>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#997E67]">
        {label}
      </span>
      <textarea
        {...rest}
        className="w-full rounded-xl border border-[#CCBEB1] bg-white px-3 py-2.5 text-sm text-[#2B2118] placeholder:text-[#B9A892] focus:border-[#997E67] focus:outline-none focus:ring-2 focus:ring-[#FFDBBB]"
      />
    </label>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl bg-[#664930] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#523a26] disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl border border-[#CCBEB1] bg-white px-4 py-2.5 text-sm font-semibold text-[#664930] transition hover:bg-[#FFF1E3] disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}
