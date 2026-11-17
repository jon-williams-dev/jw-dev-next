/**
 * ============================================================
 *  PRODUKTY – přidání / úprava produktu
 *
 *  Každý produkt je jeden blok { ... }. Pro nový produkt
 *  zkopírujte celý blok, vložte pod ostatní a změňte hodnoty.
 *  - slug:   krátký název do adresy (bez diakritiky a mezer)
 *  - price:  cena bez DPH v Kč (jen číslo)
 *  - image:  obrázek dejte do složky public/mar-con/images/produkty
 *            a zapište jako "/mar-con/images/produkty/nazev.jpg"
 *
 *  POZOR: níže jsou ukázková data z původního e-shopu –
 *  nahraďte je skutečnými produkty.
 * ============================================================
 */

export const products = [
  {
    slug: "903-dry-rack",
    name: "Sušicí stojan 903 Dry Rack",
    catalogNumber: "10539521",
    manufacturer: "Whatman",
    category: "Neonatální screening",
    pack: "1 ks",
    price: 98,
    available: true,
    short: "Stojan pro bezpečné sušení odběrních karet 903 při novorozeneckém screeningu.",
    description: [
      "Stojan umožňuje vodorovné sušení odběrních karet bez kontaktu kapek krve s povrchem.",
      "Vhodný pro porodnice a laboratoře novorozeneckého screeningu.",
    ],
  },
  {
    slug: "harris-micropunch-3mm",
    name: "Harris Micro-Punch 3,0 mm",
    catalogNumber: "WB100063",
    manufacturer: "Whatman",
    category: "Neonatální screening",
    pack: "1 ks",
    price: 2820,
    available: true,
    short: "Ruční vysekávač pro odběr vzorků ze suchých krevních skvrn.",
    description: [
      "Přesné vysekávání disků o průměru 3,0 mm z odběrních karet.",
      "Robustní konstrukce pro každodenní laboratorní provoz.",
    ],
  },
  {
    slug: "nuclepore-25mm-005um",
    name: "Nuclepore membránové filtry, 25 mm, 0,05 µm",
    catalogNumber: "110603",
    manufacturer: "Whatman",
    category: "Filtrace",
    pack: "100 ks / bal.",
    price: 2856,
    available: true,
    short: "Polykarbonátové track-etch membrány s přesně definovanou velikostí pórů.",
    description: [
      "Hladký povrch a přesná velikost pórů – ideální pro mikroskopii a analýzu částic.",
      "Balení obsahuje 100 kruhových filtrů o průměru 25 mm.",
    ],
  },
];

export const getProduct = (slug) => products.find((p) => p.slug === slug);

export const formatPrice = (czk) =>
  new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(czk);
