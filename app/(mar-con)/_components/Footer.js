import Link from "next/link";
import { nav, site } from "../_content/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-[#f6f9fb]">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-slate">
            Zástupce renomovaných výrobců laboratorního materiálu na českém trhu od roku {site.since}.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Kontakt</h3>
          <ul className="mt-3 space-y-1 text-slate">
            <li>{site.name}</li>
            <li>{site.address.street}</li>
            <li>{site.address.city}</li>
            {site.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-brand-dark">
                  {p}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-brand-dark">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Stránky</h3>
          <ul className="mt-3 space-y-1 text-slate">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-brand-dark">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-1 py-5 text-sm text-slate md:flex-row md:justify-between">
          <span>
            © {new Date().getFullYear()} {site.name} · IČ {site.ico}
          </span>
          <span>{site.register}</span>
        </div>
      </div>
    </footer>
  );
}
