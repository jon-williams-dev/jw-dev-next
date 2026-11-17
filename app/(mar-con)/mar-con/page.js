import Link from "next/link";
import Image from "next/image";
import { site } from "../_content/site";
import { products } from "../_content/products";
import { ProductCard } from "../_components/ProductCard";

const years = new Date().getFullYear() - site.since;

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <Wave className="pointer-events-none absolute -right-24 top-10 w-[42rem] opacity-60" />
        <div className="container-page relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate shadow-sm ring-1 ring-line">
              <span className="h-2 w-2 rounded-full bg-lime" /> Na českém trhu od roku {site.since}
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Spolehlivý partner pro bezproblémové fungování <span className="text-brand">Vaší laboratoře</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate">
              Filtrační papíry, membránové filtry, filtrační zařízení a příslušenství pro novorozenecký screening – s
              odbornou podporou a přímou návazností na výrobce.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/mar-con/produkty" className="btn btn-primary">
                Prohlédnout produkty
              </Link>
              <Link href="/mar-con/kontakt" className="btn btn-ghost">
                Kontaktujte nás
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Stat value={`${years}+`} label="let zkušeností" />
            <Stat value="Přímo" label="od výrobců Cytiva a EBF" />
            <Stat value="Rychle" label="vyřízení objednávek e-mailem" />
            <Stat value="Osobně" label="odborné poradenství" />
          </div>
        </div>
      </section>

      {/* PRODUKTY */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Naše produkty</h2>
            <p className="mt-2 text-slate">Ceny jsou uvedeny bez DPH.</p>
          </div>
          <Link href="/mar-con/produkty" className="font-semibold text-brand-dark hover:underline">
            Všechny produkty →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* JAK OBJEDNAT */}
      <section className="bg-ink text-white">
        <div className="container-page py-20">
          <h2 className="text-3xl font-bold tracking-tight">Jak objednat</h2>
          <p className="mt-2 max-w-2xl text-white/70">
            Jednoduše a bez registrace. Platba převodem na základě faktury.
          </p>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Vyberte produkty", "Zvolte produkty a počet kusů v objednávkovém formuláři."],
              ["Odešlete objednávku", "Objednávka nám přijde e-mailem, případně nám rovnou zavolejte."],
              ["Zaplaťte převodem", "Potvrdíme dostupnost a zašleme fakturu. Zboží expedujeme po úhradě."],
            ].map(([title, text], i) => (
              <li key={title} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-white/70">{text}</p>
              </li>
            ))}
          </ol>
          <Link href="/mar-con/objednavka" className="btn btn-primary mt-10">
            Přejít k objednávce
          </Link>
        </div>
      </section>

      {/* O NÁS */}
      <section className="container-page grid gap-12 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">O nás</h2>
          <div className="mt-6 space-y-4 text-slate">
            <p>
              <strong className="text-ink">{site.name}</strong> na českém trhu působí již od roku {site.since} jako
              zástupce renomovaných producentů z laboratorní oblasti.
            </p>
            <p>
              Naší snahou je pokrýt co nejširší záběr požadavků od zákazníků z chemických a mikrobiologických laboratoří
              v odvětví potravinářském a chemickém. Dále jsme dodavatelem zdravotnického příslušenství pro novorozenecký
              screening.
            </p>
            <p>
              Naše služby neustále zlepšujeme, abychom byli nejen spolehlivým, důvěryhodným a rychlým dodavatelem, ale
              především Vaším partnerem.
            </p>
          </div>
          <div className="mt-8">
            <Image
              src="/mar-con/images/podpis.jpg"
              alt="Podpis jednatele"
              width={150}
              height={92}
              className="mix-blend-multiply"
            />
            <p className="text-sm text-slate">{site.director}, jednatel společnosti</p>
          </div>
        </div>

        <div className="rounded-3xl bg-lime-50 p-8">
          <h3 className="text-xl font-semibold">Zastupujeme výrobce</h3>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {site.manufacturers.map((m) => (
              <a
                key={m.name}
                href={m.url}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-center rounded-xl bg-white p-4 ring-1 ring-line hover:ring-brand"
              >
                <Image src={m.logo} alt={m.name} width={200} height={78} />
              </a>
            ))}
          </div>
          <h3 className="mt-10 text-xl font-semibold">Ke stažení</h3>
          <ul className="mt-4 space-y-2">
            {site.catalogs.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-3 rounded-xl bg-white p-4 font-medium ring-1 ring-line hover:ring-brand"
                >
                  <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">PDF</span>
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
      <div className="text-3xl font-bold text-brand">{value}</div>
      <div className="mt-1 text-slate">{label}</div>
    </div>
  );
}

function Wave({ className }) {
  return (
    <svg viewBox="0 0 600 200" className={className} aria-hidden>
      <path
        d="M10 160 C 120 20, 220 20, 300 100 S 480 200, 590 40"
        fill="none"
        stroke="var(--color-lime)"
        strokeOpacity=".35"
        strokeWidth="28"
        strokeLinecap="round"
      />
    </svg>
  );
}
