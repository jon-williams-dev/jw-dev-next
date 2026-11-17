import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "../_content/products";

export function ProductCard({ product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg hover:shadow-brand/10">
      <Link
        href={`/mar-con/produkty/${product.slug}`}
        className="relative block aspect-[4/3] bg-gradient-to-br from-brand-50 to-lime-50"
      >
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain p-6" />
        ) : (
          <ProductPlaceholder />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate">
          {product.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold leading-snug">
          <Link href={`/mar-con/produkty/${product.slug}`} className="hover:text-brand-dark">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-slate">{product.short}</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 text-sm text-slate">
          <dt>Kat. číslo</dt>
          <dd className="text-right font-medium text-ink">{product.catalogNumber}</dd>
          <dt>Balení</dt>
          <dd className="text-right font-medium text-ink">{product.pack}</dd>
        </dl>
        <div className="mt-5 flex items-end justify-between border-t border-line pt-5">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate">Cena bez DPH</div>
            <div className="text-2xl font-bold">{formatPrice(product.price)}</div>
          </div>
          <Link href={`/mar-con/objednavka?produkt=${product.slug}`} className="btn btn-primary">
            Objednat
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductPlaceholder() {
  return (
    <svg viewBox="0 0 200 150" className="absolute inset-0 m-auto h-2/3 w-2/3 text-brand/40" aria-hidden>
      <circle cx="100" cy="75" r="48" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="100" cy="75" r="32" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
      <path
        d="M58 75 C 75 55, 90 55, 100 75 S 125 95, 142 75"
        fill="none"
        stroke="var(--color-lime)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
