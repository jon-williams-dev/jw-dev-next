import { PageHeader } from "../../_components/PageHeader";
import { OrderForm } from "./OrderForm";
import { site } from "../../_content/site";

export const metadata = { title: "Objednávka" };

export default async function OrderPage({ searchParams }) {
  const { produkt } = await searchParams;
  return (
    <>
      <PageHeader
        title="Objednávka"
        lead={`Bez registrace. Vyberte produkty, vyplňte údaje a objednávku odešlete – nebo zavolejte na ${site.phones[0]}.`}
      />
      <div className="container-page mt-12">
        <OrderForm preselected={produkt} />
      </div>
    </>
  );
}
