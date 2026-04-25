"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home",     href: "/" },
  { label: "History",  href: "/sessions" },
  { label: "Report",   href: "/report" },
  { label: "Settings", href: "/settings" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-zinc-800/60 bg-zinc-950 px-4 sm:px-7">
        <Link href="/" className="text-base font-extrabold tracking-tight text-white sm:text-lg">
          Poker Tracker
        </Link>

        {/* Desktop: Option C — text links with green underline */}
        <nav className="hidden items-center gap-7 sm:flex">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`border-b-2 pb-0.5 text-sm transition-colors ${
                isActive(href)
                  ? "border-emerald-500 font-semibold text-white"
                  : "border-transparent font-normal text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile: hamburger */}
        <button
          className="flex flex-col items-end gap-[5px] p-1 sm:hidden"
          onClick={() => setDrawerOpen((o) => !o)}
          aria-label="Open menu"
        >
          <span className={`block h-0.5 w-5 rounded-sm bg-white transition-all duration-200 ${drawerOpen ? "translate-y-[7px] rotate-45 bg-emerald-400" : ""}`} />
          <span className={`block h-0.5 rounded-sm bg-white transition-all duration-200 ${drawerOpen ? "w-0 opacity-0" : "w-3.5"}`} />
          <span className={`block h-0.5 w-5 rounded-sm bg-white transition-all duration-200 ${drawerOpen ? "-translate-y-[7px] -rotate-45 bg-emerald-400" : ""}`} />
        </button>
      </header>

      {/* Mobile drawer backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 sm:hidden ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile drawer panel */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[200px] flex-col border-l border-zinc-800 bg-[#1a1a1c] transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] sm:hidden ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="border-b border-zinc-800 px-5 py-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Menu</span>
        </div>
        {NAV_ITEMS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setDrawerOpen(false)}
            className={`flex items-center justify-between border-b border-zinc-900 px-5 py-[14px] text-[15px] transition-colors ${
              isActive(href) ? "font-bold text-emerald-400" : "font-normal text-white"
            }`}
          >
            {label}
            {isActive(href) && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
          </Link>
        ))}
      </div>
    </>
  );
}
