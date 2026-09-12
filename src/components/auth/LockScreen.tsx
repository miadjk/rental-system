"use client";

import React, { useState } from "react";
import { useAuth } from "@/src/store/AuthContext";
import { validatePasswordFormat } from "@/src/lib/utils";

export function LockScreen() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fmt = validatePasswordFormat(password);
    if (fmt) {
      setError(fmt);
      return;
    }
    setBusy(true);
    const res = await login(password);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Incorrect password.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[#EDE4D9] bg-white p-8 shadow-[0_8px_30px_rgba(102,73,48,0.08)]">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[#997E67]">
            Boutique Access
          </p>
          <h1 className="font-heading mt-2 text-center text-3xl font-bold text-[#664930]">
            CHO RENTAL
          </h1>
          <p className="mt-2 text-center text-sm text-[#997E67]">
            Enter your owner password to open the tracking system.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#997E67]">
                Owner password
              </span>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  maxLength={9}
                  autoFocus
                  className="w-full rounded-xl border border-[#CCBEB1] bg-white px-3 py-3 pr-16 text-sm tracking-widest text-[#2B2118] focus:border-[#997E67] focus:outline-none focus:ring-2 focus:ring-[#FFDBBB]"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-[#997E67] hover:bg-[#FFF1E3]"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              <span className="mt-1 block text-xs text-[#B9A892]">
                9 characters · letters + numbers + symbol
              </span>
            </label>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || password.length === 0}
              className="w-full rounded-xl bg-[#664930] py-3 text-sm font-semibold text-white transition hover:bg-[#523a26] disabled:opacity-50"
            >
              {busy ? "Unlocking…" : "Unlock System"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-[#B9A892]">
          Single-owner access · Session only · No accounts
        </p>
      </div>
    </div>
  );
}
