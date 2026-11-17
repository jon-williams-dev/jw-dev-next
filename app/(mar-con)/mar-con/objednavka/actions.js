"use server";

import { formatPrice, getProduct } from "../../_content/products";
import { site } from "../../_content/site";

/** Sestaví text objednávky. Ceny se berou vždy ze souboru products.ts, ne z prohlížeče. */
function buildOrder(input) {
  const lines = input.items
    .map((i) => ({ p: getProduct(i.slug), qty: Math.floor(Number(i.qty)) }))
    .filter((l) => !!l.p && l.qty > 0 && l.qty < 10000);

  const total = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const subject = `Objednávka z webu – ${input.company || input.name}`;
  const body = [
    "OBJEDNÁVKA Z WEBU mar-con.cz",
    "",
    ...lines.map((l) => `${l.qty} × ${l.p.name} (kat. č. ${l.p.catalogNumber}) – ${formatPrice(l.p.price * l.qty)}`),
    "",
    `Celkem bez DPH: ${formatPrice(total)}`,
    "",
    "ODBĚRATEL",
    `Firma / instituce: ${input.company}`,
    `IČ: ${input.ico}`,
    `Kontaktní osoba: ${input.name}`,
    `E-mail: ${input.email}`,
    `Telefon: ${input.phone}`,
    `Fakturační / dodací adresa: ${input.address}`,
    "",
    `Poznámka: ${input.note || "—"}`,
  ].join("\n");

  return { lines, subject, body };
}

export async function sendOrder(input) {
  const { lines, subject, body } = buildOrder(input);

  if (lines.length === 0) return { ok: false, error: "Vyberte prosím alespoň jeden produkt." };
  if (!input.name.trim() || !/^\S+@\S+\.\S+$/.test(input.email) || !input.address.trim())
    return { ok: false, error: "Vyplňte prosím jméno, platný e-mail a adresu." };

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Bez nastaveného e-mailového účtu: objednávka se otevře v e-mailovém programu zákazníka.
    return { ok: false, fallback: "mailto", subject, body };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ORDER_FROM ?? "Web MAR-CON <objednavky@mar-con.cz>",
      to: [site.orderEmail],
      cc: [input.email],
      reply_to: input.email,
      subject,
      text: body,
    }),
  });

  if (!res.ok) {
    return { ok: false, fallback: "mailto", subject, body };
  }
  return { ok: true };
}
