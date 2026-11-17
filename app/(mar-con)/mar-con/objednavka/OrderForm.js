"use client";

import { useMemo, useState, useTransition } from "react";
import { formatPrice, products } from "../../_content/products";
import { site } from "../../_content/site";
import { sendOrder } from "./actions";

const empty = { company: "", ico: "", name: "", email: "", phone: "", address: "", note: "" };

export function OrderForm({ preselected }) {
  const [qty, setQty] = useState(() =>
    Object.fromEntries(products.map((p) => [p.slug, p.slug === preselected ? 1 : 0])),
  );
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState({ kind: "idle" });
  const [pending, start] = useTransition();

  const total = useMemo(() => products.reduce((s, p) => s + p.price * (qty[p.slug] ?? 0), 0), [qty]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const change = (slug, d) => setQty((q) => ({ ...q, [slug]: Math.max(0, (q[slug] ?? 0) + d) }));

  function submit(e) {
    e.preventDefault();
    const input = { ...form, items: Object.entries(qty).map(([slug, q]) => ({ slug, qty: q })) };
    start(async () => {
      const res = await sendOrder(input);
      if (res.ok) return setStatus({ kind: "sent" });
      if ("fallback" in res) {
        window.location.href = `mailto:${site.orderEmail}?subject=${encodeURIComponent(res.subject)}&body=${encodeURIComponent(res.body)}`;
        return setStatus({ kind: "mailto" });
      }
      setStatus({ kind: "error", msg: res.error });
    });
  }

  if (status.kind === "sent") {
    return (
      <div className="rounded-3xl bg-lime-50 p-10 text-center">
        <h2 className="text-2xl font-bold">Děkujeme za objednávku</h2>
        <p className="mt-3 text-slate">
          Kopii jsme poslali na {form.email}. Ozveme se s potvrzením dostupnosti a fakturou k úhradě převodem.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-10">
        <fieldset>
          <legend className="text-xl font-semibold">1. Produkty a množství</legend>
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
            {products.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-slate">
                    Kat. č. {p.catalogNumber} · {p.pack} · {formatPrice(p.price)} bez DPH
                  </div>
                </div>
                <div className="flex items-center rounded-xl border border-line">
                  <button
                    type="button"
                    onClick={() => change(p.slug, -1)}
                    className="h-11 w-11 text-xl"
                    aria-label={`Méně – ${p.name}`}
                  >
                    −
                  </button>
                  <input
                    inputMode="numeric"
                    value={qty[p.slug] ?? 0}
                    onChange={(e) => setQty((q) => ({ ...q, [p.slug]: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="h-11 w-14 border-x border-line text-center font-semibold"
                    aria-label={`Počet – ${p.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => change(p.slug, 1)}
                    className="h-11 w-11 text-xl"
                    aria-label={`Více – ${p.name}`}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset>
          <legend className="text-xl font-semibold">2. Vaše údaje</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Firma / instituce" value={form.company} onChange={set("company")} />
            <Field label="IČ" value={form.ico} onChange={set("ico")} />
            <Field label="Kontaktní osoba *" value={form.name} onChange={set("name")} required />
            <Field label="Telefon" type="tel" value={form.phone} onChange={set("phone")} />
            <Field
              label="E-mail *"
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              className="sm:col-span-2"
            />
            <Field
              label="Fakturační a dodací adresa *"
              value={form.address}
              onChange={set("address")}
              required
              textarea
              className="sm:col-span-2"
            />
            <Field label="Poznámka" value={form.note} onChange={set("note")} textarea className="sm:col-span-2" />
          </div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-3xl bg-brand-50 p-8">
          <h2 className="text-xl font-semibold">Souhrn</h2>
          <ul className="mt-4 space-y-2 text-slate">
            {products
              .filter((p) => qty[p.slug] > 0)
              .map((p) => (
                <li key={p.slug} className="flex justify-between gap-4">
                  <span>
                    {qty[p.slug]} × {p.name}
                  </span>
                  <span className="whitespace-nowrap font-medium text-ink">{formatPrice(p.price * qty[p.slug])}</span>
                </li>
              ))}
            {total === 0 && <li>Zatím nemáte vybraný žádný produkt.</li>}
          </ul>
          <div className="mt-6 flex justify-between border-t border-line pt-4 text-lg">
            <span>Celkem bez DPH</span>
            <span className="font-bold">{formatPrice(total)}</span>
          </div>
          <button disabled={pending || total === 0} className="btn btn-primary mt-6 w-full text-lg disabled:opacity-50">
            {pending ? "Odesílám…" : "Odeslat objednávku"}
          </button>
          {status.kind === "error" && <p className="mt-3 text-red-700">{status.msg}</p>}
          {status.kind === "mailto" && (
            <p className="mt-3 text-slate">
              Otevřeli jsme Váš e-mailový program s připravenou objednávkou – stačí ji odeslat. Pokud se neotevřel,
              napište nám na{" "}
              <a href={`mailto:${site.orderEmail}`} className="font-semibold text-ink">
                {site.orderEmail}
              </a>
              .
            </p>
          )}
          <p className="mt-6 text-sm text-slate">
            Platba převodem na základě faktury. Odesláním souhlasíte s{" "}
            <a href="/mar-con/obchodni-podminky" className="underline">
              obchodními podmínkami
            </a>
            .
          </p>
        </div>
      </aside>
    </form>
  );
}

function Field({ label, textarea, className = "", ...props }) {
  const cls =
    "mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      {textarea ? <textarea rows={3} className={cls} {...props} /> : <input className={cls} {...props} />}
    </label>
  );
}
