import { PRICE_TIERS } from '../lib/transport_pricing'
import { TRANSPORT_PAGES } from '../lib/transport_domains'

const minPrice = Math.min(...Object.values(PRICE_TIERS[0].prices))
const longPrice = Math.min(...Object.values(PRICE_TIERS[PRICE_TIERS.length - 1].prices))
const longRange = `${PRICE_TIERS[PRICE_TIERS.length - 1].min}–${PRICE_TIERS[PRICE_TIERS.length - 1].max} km`

export const LANGS = {
    en: { ...TRANSPORT_PAGES.en, label: 'EN', name: 'English', locale: 'en_GB' },
    de: { ...TRANSPORT_PAGES.de, label: 'DE', name: 'Deutsch', locale: 'de_DE' },
}

const en = {
    meta: {
        title: 'Motorcycle Transport Germany & Europe | JW Motorcycle Transport',
        siteName: 'JW Motorcycle Transport',
        description: `Door-to-door motorcycle transport across Germany and Europe in an enclosed van. Fixed prices from €${minPrice}, insured, based near Tübingen. Free quote.`,
    },
    nav: {
        services: 'Services',
        howItWorks: 'How It Works',
        prices: 'Prices',
        about: 'About',
        faq: 'FAQ',
        quote: 'Quote',
        contact: 'Contact',
        requestQuote: 'Request a Quote',
    },
    hero: {
        title: <><span className='has-text-grey'>JW</span> Motorcycle Transport in Germany & Europe</>,
        paragraphs: [
            <>Looking for a safe, reliable way to transport your motorcycle within Germany or across Europe? You've come to the right place. I offer professional motorbike transport services for private and business customers, whether you're buying or selling a bike, moving house, or heading to an event. Your motorcycle is handled with care, loaded professionally, and delivered door-to-door in a fully enclosed van.</>,
            <>I understand how much your bike means to you — that’s why I treat every vehicle like it’s my own. No matter where you are in Germany, I’ll get your motorcycle to its destination safely, securely, and on time.</>,
            <>Based near Tübingen, operating throughout Germany and neighboring countries.<br />Request a free quote today – fast replies, no obligation.</>,
        ],
    },
    services: {
        title: 'Services',
        subtitle: '(What I Offer)',
        paragraphs: [
            <>I specialize in <strong>motorbike transportation services</strong> across Germany and neighboring regions. My van is fully equipped for motorcycle transport, including ramps, wheel chocks, and soft straps to ensure a smooth and secure journey for your bike.</>,
            <>Whether you’re a private rider, a workshop, or a dealer, I’ve got you covered:</>,
        ],
        listTitle: 'My core services include:',
        items: [
            ['Private Motorcycle Transport', 'Bought or sold a bike? Let me handle pickup and delivery.'],
            ['Event & Race Transport', 'Need your motorcycle at a track day, rally, or show? I’ll get it there, ready to ride.'],
            ['Relocation Assistance', 'Moving house? I’ll move your bike with care.'],
            ['Workshop Transfers', 'Bike needs work? I’ll transport it to your trusted mechanic or garage.'],
            ['Anything Related to Moving Motorbikes', 'Need something else? If it involves a motorcycle, I’m happy to help. Just ask.'],
        ],
    },
    howItWorks: {
        title: 'How It Works',
        subtitle: '(From A to B Without the Stress)',
        intro: <>My goal is to make <strong>motorbike transport as simple and worry-free as possible</strong>. Here's how the process works from start to finish:</>,
        start: 'Start',
        finish: 'Finish',
        steps: [
            { title: 'Request a Quote', text: 'Send me your transport details — pickup and drop-off locations, bike type, preferred dates, and anything special I should know.' },
            { title: 'I Confirm the Plan', text: 'You’ll receive a clear quote and we’ll agree on a date and time. Once confirmed, we’re locked in.' },
            { note: 'Note: Standard prices assume a flexible schedule, so I can plan your bike onto a route with other bookings. Need it on a specific date? Express options are also available.' },
            { title: 'I Collect Your Bike', text: 'I arrive on time, load your motorcycle using a ramp and soft straps, and secure it carefully for transport in my van.' },
            { note: 'In case of delays, I’ll keep you updated and can share my live location so you always know where your bike is.' },
            { title: 'I Deliver Your Bike', text: 'At the other end, I unload your bike and hand it over safely. I’ll keep in touch during the journey and confirm delivery.' },
        ],
    },
    prices: {
        title: 'Prices',
        subtitle: '(Fair & Transparent Motorcycle Transport Rates)',
        intro: [
            <>I believe in clear and honest pricing. Every bike gets a fixed price based on just two things: <strong>the road distance from pickup to drop-off</strong> and <strong>the size of your bike</strong>. You don't pay for my drive to collect your bike or my drive home afterwards.</>,
            <>The price you're quoted is the price you pay. It won't change if other bookings are added to or removed from the route.</>,
            <>Bike size categories are a general reference. I'll confirm the category based on make, model, and weight when you request a quote. Extra charges only apply if your bike doesn't run, needs special handling, or comes with spare parts, and I'll always agree these with you upfront.</>,
        ],
        notes: [
            <><span className="has-text-weight-bold">Please note</span>: These prices are for flexible, planned routes. I plan each trip so that several bikes travel together in the van, collecting and delivering them in the most efficient order. This keeps prices fair and reduces empty driving, but delivery may take a little longer while I plan a route that fits.</>,
            <>If needed, I can store your motorcycle securely until delivery. If your transport is urgent or needs a fixed date or time window, I can still help. Your bike may need its own trip, so I'll calculate the price individually. Just mention it when you request a quote.</>,
            <><span className="has-text-weight-bold">For distances over 600 km or international deliveries</span>, prices depend on the actual route and will always be quoted individually.</>,
            <>All transports include secure loading with soft straps, enclosed van transport, and basic insurance. If your bike doesn’t run, needs special handling, or you’re transporting extra parts, I’ll be happy to discuss the best options.</>,
        ],
        cards: {
            sizes: {
                Small: ['Small', 'Scooters / 50cc–125cc'],
                Medium: ['Medium', 'Standard / Naked / Touring'],
                Large: ['Large', 'Adventure / Cruiser / Heavy'],
            },
            upTo: 'Up to',
            customQuote: 'Custom quote',
        },
    },
    about: {
        title: 'About',
        subtitle: '(Passion for Motorbikes)',
        paragraphs: [
            'My name is Jon, and I’ve been passionate about motorbikes for as long as I can remember. What began as a hobby — transporting my own bikes and helping friends move theirs — has grown into a business built on reliability, attention to detail, and genuine respect for every motorcycle I handle.',
            'I’m not a faceless logistics company. I’m the person who answers your call, loads your bike, and delivers it personally. You’ll never have to deal with a call center or wonder where your bike is.',
            'I operate a clean, fully equipped van with professional securing gear, based near Tübingen and covering all of Germany and beyond. I make sure your bike arrives exactly as it left — safe, secure, and ready to ride.',
            'Whether it’s your daily ride, your pride and joy, or a new project bike, I’ll treat it with the same care I’d give my own.',
        ],
    },
    faq: {
        title: 'FAQ',
        subtitle: '(Your Questions Answered)',
        items: [
            ['Do you cover all of Germany?', 'Yes – I offer motorcycle transport across all of Germany, including long-distance routes and trips to/from Austria, Switzerland, France, and the Netherlands.'],
            ['How is my price calculated?', <>Your price is based on the road distance from pickup to drop-off and the size of your bike (see <a href="#prices">Prices</a>). My travel to and from your bike isn't added on top. Because I plan routes so several bikes share the trip, I can keep prices lower than a dedicated single-bike transport.</>, 'Your price is based on the road distance from pickup to drop-off and the size of your bike. My travel to and from your bike isn\'t added on top. Because I plan routes so several bikes share the trip, I can keep prices lower than a dedicated single-bike transport.'],
            ['How much does motorcycle transport cost?', `Prices start at €${minPrice} for distances up to ${PRICE_TIERS[0].max} km. Longer trips of ${longRange} start at €${longPrice}. The exact price depends on the distance and the size of your bike, and you'll get a fixed price in your quote.`],
            ['Why can delivery take a few days?', 'To keep prices low, I wait until I can plan a route that combines your bike with other bookings in the same direction. I\'ll always tell you the planned date in advance. If you need a specific date, ask for an express quote.'],
            ['Is the transport insured?', 'Yes, basic insurance is included in every transport. For high-value bikes, additional coverage can be arranged on request.'],
            ['Can you transport non-running bikes?', 'Absolutely – just let me know in advance. I have a winch and equipment to handle bikes that don’t start or roll.'],
            ['How far in advance should I book?', 'I recommend booking as early as possible, but I can often handle short-notice jobs depending on location and availability.'],
            ['Can I include spare parts or accessories?', 'Yes, as long as they are securely packed. Please let me know what\'s included when booking. If there’s space available, I’m happy to transport them — just note that an extra charge may apply depending on the size and amount of items.'],
        ],
    },
    quote: {
        title: 'Request a Quote',
        form: {
            name: 'Your Name',
            email: 'Email Address',
            bikeType: 'Bike Type',
            bikeTypePlaceholder: 'Select bike type',
            bikeTypes: {
                Small: 'Small (50cc–125cc)',
                Medium: 'Medium (Standard/Naked/Touring)',
                Large: 'Large (Adventure/Cruiser/Heavy)',
            },
            bikeInfo: 'Bike information',
            bikeInfoHelp: 'Please enter the year, make, and model of the motorcycle, e.g. “2021 Yamaha MT-07”.',
            pickup: 'Pickup Location',
            pickupHelp: 'Enter the full address or at least the city and postcode where the bike should be picked up.',
            dropoff: 'Drop-off Location',
            dropoffHelp: 'Enter the full address or city/postcode where the bike should be delivered.',
            notes: 'Notes (Optional)',
            notesHelp: 'Add any extra details or questions – for example, if the bike doesn’t run, has accessories, requires special handling, or if the delivery is urgent or needs to happen by a specific date. Feel free to include anything else you think might be helpful.',
            sending: 'Sending your request...',
            success: 'Thank you! Your request has been sent.',
            error: 'Something went wrong. Please try again.',
            submit: 'Send Request',
            submitting: 'Sending...',
        },
    },
}

const de = {
    meta: {
        title: 'Motorradtransport Deutschland & Europa | JW Motorradtransport',
        siteName: 'JW Motorradtransport',
        description: `Motorradtransport von Tür zu Tür in ganz Deutschland und Europa: im geschlossenen Transporter, versichert, Festpreise ab ${minPrice} €. Sitz bei Tübingen. Kostenloses Angebot anfordern.`,
    },
    nav: {
        services: 'Leistungen',
        howItWorks: 'Ablauf',
        prices: 'Preise',
        about: 'Über mich',
        faq: 'FAQ',
        quote: 'Angebot',
        contact: 'Kontakt',
        requestQuote: 'Angebot anfordern',
    },
    hero: {
        title: <><span className='has-text-grey'>JW</span> Motorradtransport in Deutschland & Europa</>,
        paragraphs: [
            <>Sie suchen eine sichere und zuverlässige Möglichkeit, Ihr Motorrad innerhalb Deutschlands oder quer durch Europa zu transportieren? Dann sind Sie hier genau richtig. Ich biete professionelle Motorradtransporte für Privat- und Geschäftskunden an, ob Sie ein Motorrad kaufen oder verkaufen, umziehen oder zu einer Veranstaltung möchten. Ihr Motorrad wird sorgfältig behandelt, professionell verladen und im geschlossenen Transporter von Tür zu Tür geliefert.</>,
            <>Ich weiß, wie viel Ihnen Ihr Motorrad bedeutet. Deshalb behandle ich jedes Fahrzeug, als wäre es mein eigenes. Egal, wo in Deutschland Sie sind: Ich bringe Ihr Motorrad sicher und pünktlich an sein Ziel.</>,
            <>Mit Sitz in der Nähe von Tübingen, unterwegs in ganz Deutschland und den Nachbarländern.<br />Fordern Sie noch heute ein kostenloses Angebot an – schnelle Antwort, unverbindlich.</>,
        ],
    },
    services: {
        title: 'Leistungen',
        subtitle: '(Was ich anbiete)',
        paragraphs: [
            <>Ich bin auf <strong>Motorradtransporte</strong> in ganz Deutschland und den angrenzenden Regionen spezialisiert. Ob Sie Ihr Motorrad nach dem Kauf überführen lassen, zur Werkstatt bringen lassen oder einfach sicher von A nach B transportieren lassen möchten: Ich kümmere mich darum. Mein Transporter ist komplett für den Motorradtransport ausgestattet, mit Auffahrrampe, Radklemmen und weichen Spanngurten, damit Ihr Motorrad sicher und schonend ankommt.</>,
            <>Ob Privatfahrer, Werkstatt oder Händler: Ich bin für Sie da.</>,
        ],
        listTitle: 'Meine Leistungen im Überblick:',
        items: [
            ['Privater Motorradtransport', 'Motorrad gekauft oder verkauft? Ich übernehme Abholung und Lieferung.'],
            ['Event- & Renntransport', 'Ihr Motorrad soll zum Trackday, zum Treffen oder zur Messe? Ich bringe es fahrbereit hin.'],
            ['Umzugshilfe', 'Sie ziehen um? Ich transportiere Ihr Motorrad mit Sorgfalt.'],
            ['Werkstatttransfer', 'Ihr Motorrad muss in die Werkstatt? Ich bringe es zu Ihrem Mechaniker oder Ihrer Werkstatt des Vertrauens.'],
            ['Alles rund um den Motorradtransport', 'Sie brauchen etwas anderes? Wenn es um Motorräder geht, helfe ich gern. Fragen Sie einfach.'],
        ],
    },
    howItWorks: {
        title: 'So funktioniert’s',
        subtitle: '(Von A nach B ohne Stress)',
        intro: <>Mein Ziel ist es, <strong>Motorradtransporte so einfach und sorgenfrei wie möglich</strong> zu machen. So läuft es von Anfang bis Ende ab:</>,
        start: 'Start',
        finish: 'Ziel',
        steps: [
            { title: 'Angebot anfordern', text: 'Senden Sie mir Ihre Transportdaten: Abhol- und Lieferort, Motorradtyp, Wunschtermine und alles Besondere, das ich wissen sollte.' },
            { title: 'Ich bestätige den Plan', text: 'Sie erhalten ein klares Angebot und wir vereinbaren Datum und Uhrzeit. Nach der Bestätigung steht der Termin fest.' },
            { note: 'Hinweis: Die Standardpreise setzen einen flexiblen Zeitplan voraus, damit ich Ihr Motorrad in eine Route mit anderen Aufträgen einplanen kann. Sie brauchen einen festen Termin? Express-Optionen sind ebenfalls möglich.' },
            { title: 'Ich hole Ihr Motorrad ab', text: 'Ich komme pünktlich, verlade Ihr Motorrad mit Rampe und weichen Spanngurten und sichere es sorgfältig in meinem Transporter.' },
            { note: 'Bei Verzögerungen halte ich Sie auf dem Laufenden und kann meinen Live-Standort teilen, damit Sie immer wissen, wo Ihr Motorrad gerade ist.' },
            { title: 'Ich liefere Ihr Motorrad', text: 'Am Ziel lade ich Ihr Motorrad ab und übergebe es sicher. Während der Fahrt bleibe ich mit Ihnen in Kontakt und bestätige die Lieferung.' },
        ],
    },
    prices: {
        title: 'Preise',
        subtitle: '(Faire und transparente Preise)',
        intro: [
            <>Ich setze auf klare und ehrliche Preise. Jedes Motorrad bekommt einen Festpreis, der nur von zwei Dingen abhängt: <strong>der Straßenentfernung vom Abhol- zum Lieferort</strong> und <strong>der Größe Ihres Motorrads</strong>. Meine Anfahrt zur Abholung und meine Rückfahrt bezahlen Sie nicht.</>,
            <>Der Preis im Angebot ist der Preis, den Sie zahlen. Er ändert sich nicht, wenn andere Aufträge zur Route hinzukommen oder wegfallen.</>,
            <>Die Größenkategorien dienen als Orientierung. Ich bestätige die Kategorie anhand von Marke, Modell und Gewicht, wenn Sie ein Angebot anfordern. Aufpreise fallen nur an, wenn Ihr Motorrad nicht fahrbereit ist, besondere Handhabung erfordert oder Ersatzteile mitkommen, und werden immer vorab mit Ihnen abgesprochen.</>,
        ],
        notes: [
            <><span className="has-text-weight-bold">Bitte beachten</span>: Diese Preise gelten für flexible, geplante Routen. Ich plane jede Fahrt so, dass mehrere Motorräder gemeinsam im Transporter reisen und in der effizientesten Reihenfolge abgeholt und geliefert werden. Das hält die Preise fair und vermeidet Leerfahrten, die Lieferung kann aber etwas länger dauern, bis eine passende Route steht.</>,
            <>Bei Bedarf kann ich Ihr Motorrad bis zur Lieferung sicher unterstellen. Wenn Ihr Transport eilig ist oder einen festen Termin oder ein bestimmtes Zeitfenster braucht, helfe ich trotzdem gern. Ihr Motorrad braucht dann eventuell eine eigene Fahrt, daher berechne ich den Preis individuell. Erwähnen Sie es einfach bei Ihrer Anfrage.</>,
            <><span className="has-text-weight-bold">Für Strecken über 600 km oder internationale Transporte</span> hängt der Preis von der tatsächlichen Route ab und wird immer individuell kalkuliert.</>,
            <>Alle Transporte beinhalten die sichere Verladung mit weichen Spanngurten, den Transport im geschlossenen Transporter und eine Basisversicherung. Wenn Ihr Motorrad nicht fährt, besondere Handhabung braucht oder Sie zusätzliche Teile mitschicken möchten, bespreche ich gern die beste Lösung mit Ihnen.</>,
        ],
        cards: {
            sizes: {
                Small: ['Klein', 'Roller / 50–125 cm³'],
                Medium: ['Mittel', 'Standard / Naked / Touring'],
                Large: ['Groß', 'Adventure / Cruiser / Schwer'],
            },
            upTo: 'Bis',
            customQuote: 'Individuelles Angebot',
        },
    },
    about: {
        title: 'Über mich',
        subtitle: '(Leidenschaft für Motorräder)',
        paragraphs: [
            'Mein Name ist Jon, und ich begeistere mich für Motorräder, solange ich denken kann. Was als Hobby begann, mit dem Transport meiner eigenen Motorräder und denen von Freunden, ist zu einem Unternehmen geworden, das auf Zuverlässigkeit, Liebe zum Detail und echtem Respekt vor jedem Motorrad aufbaut.',
            'Ich bin kein anonymes Logistikunternehmen. Ich bin derjenige, der Ihren Anruf annimmt, Ihr Motorrad verlädt und es persönlich ausliefert. Kein Callcenter, und Sie wissen immer, wo Ihr Motorrad gerade ist.',
            'Ich fahre einen sauberen, voll ausgestatteten Transporter mit professioneller Ladungssicherung, mit Sitz in der Nähe von Tübingen und unterwegs in ganz Deutschland und darüber hinaus. Ich sorge dafür, dass Ihr Motorrad genau so ankommt, wie es abgeholt wurde: sicher, unversehrt und fahrbereit.',
            'Ob Alltagsmotorrad, ganzer Stolz oder neues Projekt: Ich behandle es mit derselben Sorgfalt wie mein eigenes.',
        ],
    },
    faq: {
        title: 'Häufige Fragen',
        subtitle: '(Ihre Fragen beantwortet)',
        items: [
            ['Fahren Sie in ganz Deutschland?', 'Ja, ich biete Motorradtransporte in ganz Deutschland an, einschließlich Langstrecken und Fahrten von und nach Österreich, in die Schweiz, nach Frankreich und in die Niederlande.'],
            ['Wie wird mein Preis berechnet?', <>Ihr Preis richtet sich nach der Straßenentfernung vom Abhol- zum Lieferort und nach der Größe Ihres Motorrads (siehe <a href="#prices">Preise</a>). Meine An- und Abfahrt wird nicht zusätzlich berechnet. Da ich Routen so plane, dass sich mehrere Motorräder eine Fahrt teilen, kann ich günstigere Preise anbieten als bei einem Einzeltransport.</>, 'Ihr Preis richtet sich nach der Straßenentfernung vom Abhol- zum Lieferort und nach der Größe Ihres Motorrads. Meine An- und Abfahrt wird nicht zusätzlich berechnet. Da ich Routen so plane, dass sich mehrere Motorräder eine Fahrt teilen, kann ich günstigere Preise anbieten als bei einem Einzeltransport.'],
            ['Was kostet ein Motorradtransport?', `Die Preise beginnen bei ${minPrice} € für Strecken bis ${PRICE_TIERS[0].max} km. Längere Strecken von ${longRange} gibt es ab ${longPrice} €. Der genaue Preis hängt von der Entfernung und der Größe Ihres Motorrads ab, und Sie erhalten im Angebot einen Festpreis.`],
            ['Warum kann die Lieferung ein paar Tage dauern?', 'Um die Preise niedrig zu halten, warte ich, bis ich eine Route planen kann, die Ihr Motorrad mit anderen Aufträgen in dieselbe Richtung kombiniert. Den geplanten Termin teile ich Ihnen immer vorab mit. Wenn Sie einen festen Termin brauchen, fragen Sie nach einem Express-Angebot.'],
            ['Ist der Transport versichert?', 'Ja, eine Basisversicherung ist bei jedem Transport inbegriffen. Für hochwertige Motorräder kann auf Wunsch eine zusätzliche Versicherung vereinbart werden.'],
            ['Transportieren Sie auch nicht fahrbereite Motorräder?', 'Selbstverständlich, sagen Sie mir einfach vorher Bescheid. Ich habe eine Seilwinde und die passende Ausrüstung für Motorräder, die nicht anspringen oder nicht rollen.'],
            ['Wie früh sollte ich buchen?', 'Am besten so früh wie möglich. Kurzfristige Aufträge kann ich aber je nach Ort und Verfügbarkeit oft auch übernehmen.'],
            ['Kann ich Ersatzteile oder Zubehör mitschicken?', 'Ja, solange alles sicher verpackt ist. Bitte teilen Sie mir bei der Buchung mit, was dabei ist. Wenn Platz ist, nehme ich es gern mit. Je nach Größe und Menge kann ein Aufpreis anfallen.'],
        ],
    },
    quote: {
        title: 'Angebot anfordern',
        form: {
            name: 'Ihr Name',
            email: 'E-Mail-Adresse',
            bikeType: 'Motorradtyp',
            bikeTypePlaceholder: 'Motorradtyp wählen',
            bikeTypes: {
                Small: 'Klein (50–125 cm³)',
                Medium: 'Mittel (Standard/Naked/Touring)',
                Large: 'Groß (Adventure/Cruiser/Schwer)',
            },
            bikeInfo: 'Angaben zum Motorrad',
            bikeInfoHelp: 'Bitte geben Sie Baujahr, Marke und Modell an, z. B. „2021 Yamaha MT-07“.',
            pickup: 'Abholort',
            pickupHelp: 'Geben Sie die vollständige Adresse oder mindestens Ort und Postleitzahl der Abholung an.',
            dropoff: 'Lieferort',
            dropoffHelp: 'Geben Sie die vollständige Adresse oder Ort und Postleitzahl der Lieferung an.',
            notes: 'Anmerkungen (optional)',
            notesHelp: 'Weitere Details oder Fragen, z. B. wenn das Motorrad nicht fährt, Zubehör dabei ist, besondere Handhabung nötig ist oder die Lieferung eilig ist bzw. bis zu einem bestimmten Datum erfolgen muss. Alles, was hilfreich sein könnte, ist willkommen.',
            sending: 'Ihre Anfrage wird gesendet...',
            success: 'Vielen Dank! Ihre Anfrage wurde gesendet.',
            error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
            submit: 'Anfrage senden',
            submitting: 'Wird gesendet...',
        },
    },
}

export const CONTENT = { en, de }
