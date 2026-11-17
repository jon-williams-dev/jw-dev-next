# /mar-con – rebuild of mar-con.cz

Lives inside jw-dev-next as an App Router route group, next to the existing `pages/` site.
Uses Tailwind 4, scoped to this folder (`mar-con.css` → `source(".")`), so the Bulma pages are untouched.

## Where to edit things

| What | File |
|---|---|
| Company details, phones, bank account, catalog PDFs, manufacturers, menu | `_content/site.js` |
| Products (name, price, catalog no., text, image) | `_content/products.js` |
| Images | `public/mar-con/images/` |
| Brand colours | `mar-con.css` (`@theme`) |
| Logo | `_components/Logo.js` (SVG rebuild of the original JPG) |

All links are prefixed with `/mar-con`.

## Orders

`/mar-con/objednavka` – quantities + customer details, no cart/login/payment gateway.

- With `RESEND_API_KEY` set, the order is emailed to `site.orderEmail` with the customer on CC (server action in `mar-con/objednavka/actions.js`; prices recomputed server-side). Optional `ORDER_FROM`.
- Without it, the customer's mail client opens with the order pre-filled (mailto fallback).

## Own domain later

To serve it on mar-con.cz, add a host rewrite in `middleware.ts` like the beacontrack.app one (`/x` → `/mar-con/x`).
Internal links currently include `/mar-con`, so either keep that prefix on the domain or strip it via the middleware redirect.

## Before launch

- Replace the example products, add photos.
- Fill in bank details / DIČ.
- Update obchodní podmínky (old text cited repealed laws 40/1964, 513/1991 Sb.).
- Get the original vector logo if it exists.
