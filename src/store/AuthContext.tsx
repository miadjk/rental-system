"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface AuthState {
  authed: boolean;
  loading: boolean;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  lock: () => void;
}

const AuthContext = createContext<AuthState>({
  authed: false,
  loading: true,
  login: async () => ({ ok: false }),
  lock: () => {},
});

const KEY = "drs-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(KEY);
      if (v === "1") setAuthed(true);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (password: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAuthed(true);
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {
          /* ignore */
        }
        return { ok: true };
      }
      return { ok: false, error: data?.error ?? "Incorrect password." };
    } catch {
      return { ok: false, error: "Could not verify password. Try again." };
    }
  }, []);

  const lock = useCallback(() => {
    setAuthed(false);
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authed, loading, login, lock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
