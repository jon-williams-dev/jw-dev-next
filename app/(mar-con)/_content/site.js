/**
 * ============================================================
 *  ÚDAJE O FIRMĚ – vše, co se zobrazuje na webu, je tady.
 *  Upravte text mezi uvozovkami a uložte. Nic jiného není třeba.
 * ============================================================
 */

export const site = {
  name: "Mar - Con, s.r.o.",
  tagline: "Spolehlivý partner pro bezproblémové fungování Vaší laboratoře",
  since: 1991,

  email: "info@mar-con.cz",
  /** Na tuto adresu chodí objednávky z webu */
  orderEmail: "info@mar-con.cz",
  phones: ["+420 251 815 250", "+420 234 697 042"],

  address: {
    street: "Geologická 995/9",
    city: "152 00 Praha 5",
  },

  ico: "170 48 435",
  dic: "", // TODO: doplnit DIČ, pokud ho chcete zobrazovat
  register: "Městský soud v Praze, oddíl C, vložka 2821",

  /** Bankovní spojení – zobrazí se u objednávky a v patičce */
  bank: {
    name: "", // TODO: např. "Komerční banka"
    account: "", // TODO: např. "123456789/0100"
    iban: "", // TODO
  },

  director: "Dr. Miroslav Červenka",

  /** Ke stažení (soubor dejte do složky public/katalogy) */
  catalogs: [
    {
      title: "Katalog Whatman – filtrace",
      href: "https://www.mar-con.cz/cenik/Whatman_Catalog.pdf",
    },
  ],

  manufacturers: [
    { name: "Cytiva (Whatman)", logo: "/mar-con/images/cytiva.jpg", url: "https://www.cytivalifesciences.com" },
    { name: "EBF", logo: "/mar-con/images/ebf.jpg", url: "https://www.ebf.cz" },
  ],
};

export const nav = [
  { href: "/mar-con", label: "Úvod" },
  { href: "/mar-con/produkty", label: "Produkty" },
  { href: "/mar-con/objednavka", label: "Objednávka" },
  { href: "/mar-con/obchodni-podminky", label: "Obchodní podmínky" },
  { href: "/mar-con/kontakt", label: "Kontakt" },
];
