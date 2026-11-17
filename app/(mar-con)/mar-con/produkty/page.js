import { products } from "../../_content/products";
import { ProductCard } from "../../_components/ProductCard";
import { PageHeader } from "../../_components/PageHeader";

export const metadata = { title: "Produkty" };

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Produkty"
        lead="Všechny ceny jsou uvedeny bez DPH. Na větší odběry rádi připravíme individuální nabídku."
      />
      <div className="container-page mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </>
  );
}
