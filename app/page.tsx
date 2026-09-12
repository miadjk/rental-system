"use client";

import { AppShell } from "@/src/components/layout/AppShell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/src/store/AuthContext";

export default function RootPage() {
  const { authed, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authed) router.replace("/dashboard");
  }, [authed, loading, router]);

  return <AppShell><div /></AppShell>;
}
