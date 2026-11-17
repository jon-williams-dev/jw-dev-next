import { PageHeader } from "../../_components/PageHeader";
import { site } from "../../_content/site";

export const metadata = { title: "Kontakt" };

export default function ContactPage() {
  const map = `https://maps.google.com/maps?q=${encodeURIComponent(`${site.address.street}, ${site.address.city}`)}&z=16&output=embed`;

  return (
    <>
      <PageHeader
        title="Kontakt"
        lead="Rádi Vám poradíme s výběrem i objednávkou. Nejrychleji nás zastihnete telefonicky."
      />
      <div className="container-page mt-12 grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <Card title="Telefon / fax">
            {site.phones.map((p) => (
              <a
                key={p}
                href={`tel:${p.replace(/\s/g, "")}`}
                className="block text-2xl font-semibold hover:text-brand-dark"
              >
                {p}
              </a>
            ))}
          </Card>
          <Card title="E-mail">
            <a href={`mailto:${site.email}`} className="text-2xl font-semibold hover:text-brand-dark">
              {site.email}
            </a>
          </Card>
          <Card title="Adresa">
            <p className="text-lg">
              {site.name}
              <br />
              {site.address.street}
              <br />
              {site.address.city}
            </p>
          </Card>
          <Card title="Fakturační údaje">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-slate">
              <dt>IČ</dt>
              <dd className="text-ink">{site.ico}</dd>
              {site.dic && (
                <>
                  <dt>DIČ</dt>
                  <dd className="text-ink">{site.dic}</dd>
                </>
              )}
              {site.bank.account && (
                <>
                  <dt>Bankovní účet</dt>
                  <dd className="text-ink">{site.bank.account}</dd>
                </>
              )}
              {site.bank.iban && (
                <>
                  <dt>IBAN</dt>
                  <dd className="text-ink">{site.bank.iban}</dd>
                </>
              )}
              <dt>Zápis</dt>
              <dd className="text-ink">{site.register}</dd>
            </dl>
          </Card>
        </div>
        <div className="overflow-hidden rounded-3xl border border-line">
          <iframe
            title="Mapa – Geologická 995/9, Praha 5"
            src={map}
            className="h-[420px] w-full lg:h-full"
            loading="lazy"
          />
        </div>
      </div>
    </>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-line p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
