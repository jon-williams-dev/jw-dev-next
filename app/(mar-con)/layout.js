import { Inter, Nunito } from "next/font/google";
import "./mar-con.css";
import { Header } from "./_components/Header";
import { Footer } from "./_components/Footer";
import { site } from "./_content/site";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["900"], variable: "--font-nunito" });

export const metadata = {
  title: { default: `MAR-CON | ${site.tagline}`, template: "%s | MAR-CON" },
  description:
    "Mar - Con, s.r.o. – zástupce renomovaných výrobců laboratorního materiálu od roku 1991. Filtrační papíry, membránové filtry a příslušenství pro novorozenecký screening.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`${inter.variable} ${nunito.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
