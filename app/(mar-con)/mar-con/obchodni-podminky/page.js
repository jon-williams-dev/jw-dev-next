import { PageHeader } from "../../_components/PageHeader";
import { site } from "../../_content/site";

export const metadata = { title: "Obchodní podmínky" };

/**
 * TODO: Text převzatý z původního webu odkazuje na zrušené zákony
 * (40/1964 Sb., 513/1991 Sb.). Před spuštěním nechte aktualizovat
 * podle zákona 89/2012 Sb. (občanský zákoník) a doplňte zbytek původního textu.
 */
export default function TermsPage() {
  return (
    <>
      <PageHeader title="Obchodní podmínky" />
      <article className="container-page prose-legal mt-10 max-w-3xl">
        <p>
          Tyto obchodní podmínky platí pro nákup prostřednictvím webu společnosti {site.name}, se sídlem{" "}
          {site.address.street}, {site.address.city}, IČ {site.ico}, zapsané v obchodním rejstříku vedeném{" "}
          {site.register}.
        </p>

        <h2>Objednávka a uzavření smlouvy</h2>
        <p>
          Objednávku lze učinit prostřednictvím objednávkového formuláře, e-mailem nebo telefonicky. Kupní smlouva je
          uzavřena okamžikem, kdy prodávající objednávku potvrdí kupujícímu e-mailem.
        </p>
        <p>
          Prodávající si vyhrazuje právo zrušit objednávku nebo její část, pokud se zboží již nevyrábí či nedodává nebo
          se výrazně změnila cena dodavatele. Již uhrazená částka bude v takovém případě kupujícímu vrácena.
        </p>

        <h2>Ceny a platba</h2>
        <p>
          Ceny jsou uvedeny bez DPH. Platba probíhá bankovním převodem na základě vystavené faktury. Zboží je expedováno
          po připsání platby, není-li dohodnuto jinak.
        </p>

        <h2>Vzorky</h2>
        <p>
          Na vzorky poskytované zdarma nelze uplatňovat práva spotřebitele; takové plnění se řídí ustanoveními o
          darovací smlouvě.
        </p>

        <h2>Reklamace</h2>
        <p>
          Běh lhůty pro vyřízení reklamace je pozastaven, dokud prodávající neobdrží veškeré podklady potřebné k jejímu
          vyřízení. Prodávající si chybějící podklady vyžádá v nejkratší možné době.
        </p>
      </article>
    </>
  );
}
