"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, site } from "../_content/site";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href) => (href === "/mar-con" ? pathname === "/mar-con" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="hidden border-b border-line bg-brand-50 md:block">
        <div className="container-page flex h-9 items-center justify-end gap-6 text-sm text-slate">
          <a href={`tel:${site.phones[0].replace(/\s/g, "")}`} className="hover:text-brand-dark">
            Tel.: {site.phones[0]}
          </a>
          <a href={`mailto:${site.email}`} className="hover:text-brand-dark">
            {site.email}
          </a>
        </div>
      </div>

      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/mar-con" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 font-medium transition-colors ${isActive(item.href) ? "text-brand-dark" : "text-ink hover:text-brand-dark"}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/mar-con/objednavka" className="btn btn-primary ml-3 !py-2">
            Objednat
          </Link>
        </nav>

        <button
          className="rounded-md border border-line px-3 py-2 font-medium lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? "Zavřít" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-white lg:hidden">
          <div className="container-page flex flex-col py-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-line py-3 text-lg last:border-0 ${isActive(item.href) ? "font-semibold text-brand-dark" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
