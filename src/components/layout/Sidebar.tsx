"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/store/AuthContext";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/inventory", label: "Dress Inventory", icon: "◍" },
  { href: "/rentals", label: "Rental Tracking", icon: "◎" },
  { href: "/returns", label: "Return Tracking", icon: "↩" },
  { href: "/history", label: "Rental History", icon: "≡" },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    "▦": (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    "◍": <path d="M12 3.5 19 12l-7 8.5L5 12l7-8.5Z" />,
    "◎": (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3.5" />
      </>
    ),
    "↩": <path d="M9 7 4.5 11.5 9 16M4.5 11.5H15a4 4 0 0 1 0 8h-3" />,
    "≡": <path d="M4.5 7h15M4.5 12h15M4.5 17h15" />,
  };
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { lock } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#2B2118]/30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-[#EDE4D9] bg-[#FFFDF9] px-4 py-6 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/dashboard" onClick={onClose} className="px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#997E67]">
            Boutique
          </p>
          <h2 className="font-heading mt-1 text-xl font-bold leading-tight text-[#664930]">
            CHO
            <span className="text-[#997E67]"> RENTAL</span>
          </h2>
          <p className="mt-1 text-xs text-[#B9A892]">Dress Rental Tracking</p>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((it) => {
            const active = pathname === it.href || pathname?.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#FFDBBB] text-[#664930]"
                    : "text-[#6d5b4c] hover:bg-[#FFF1E3]"
                }`}
              >
                <span className={active ? "text-[#664930]" : "text-[#997E67]"}>
                  <Icon name={it.icon} />
                </span>
                {it.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={lock}
          className="mt-4 flex items-center gap-3 rounded-xl border border-[#CCBEB1] bg-white px-3 py-2.5 text-sm font-medium text-[#664930] hover:bg-[#FFF1E3]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Lock System
        </button>
      </aside>
    </>
  );
}
