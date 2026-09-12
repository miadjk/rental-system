"use client";
import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[#EDE4D9] bg-white shadow-[0_1px_2px_rgba(102,73,48,0.06)] ${className}`}>
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-[#664930] md:text-[28px]">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-[#997E67]">{subtitle}</p>}
    </div>
  );
}
