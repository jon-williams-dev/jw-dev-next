import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatPrice, getProduct, products } from "../../../_content/products";
import { ProductPlaceholder } from "../../../_components/ProductCard";
import { site } from "../../../_content/site";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const product = getProduct((await params).slug);
  return product ? { title: product.name, description: product.short } : {};
}

export default async function ProductPage({ params }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  return (
    <div className="container-page py-10 md:py-16">
      <Link href="/mar-con/produkty" className="text-slate hover:text-brand-dark">
        ← Zpět na produkty
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-lime-50">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-contain p-10" />
          ) : (
            <ProductPlaceholder />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-dark">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
          <p className="mt-4 text-lg text-slate">{product.short}</p>

          <dl className="mt-8 divide-y divide-line rounded-2xl border border-line">
            {[
              ["Katalogové číslo", product.catalogNumber],
              ["Výrobce", product.manufacturer],
              ["Balení", product.pack],
              ["Dostupnost", product.available ? "Skladem / k dispozici" : "Na dotaz"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-5 py-3">
                <dt className="text-slate">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-50 p-6">
            <div>
              <div className="text-sm text-slate">Cena bez DPH</div>
              <div className="text-3xl font-bold">{formatPrice(product.price)}</div>
            </div>
            <Link href={`/mar-con/objednavka?produkt=${product.slug}`} className="btn btn-primary text-lg">
              Objednat
            </Link>
          </div>
          <p className="mt-4 text-slate">
            Raději telefonicky? Zavolejte na{" "}
            <a href={`tel:${site.phones[0].replace(/\s/g, "")}`} className="font-semibold text-ink">
              {site.phones[0]}
            </a>
            .
          </p>

          <div className="mt-10 space-y-3 text-slate">
            {product.description.map((d) => (
              <p key={d}>{d}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
