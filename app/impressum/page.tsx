import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Impressum · Vitness Crew",
  robots: { index: true, follow: false },
};

export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Impressum
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Angaben gemäß § 5 TMG
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Anbieter
          </h2>
          <p className="mt-2 whitespace-pre-line">
            {/* TODO: Mit echten Firmen-Daten von v-itness.de befüllen */}
            V-Itness GmbH{"\n"}
            [Straße + Hausnummer]{"\n"}
            [PLZ Ort]{"\n"}
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Vertretungsberechtigt
          </h2>
          <p className="mt-2">
            Geschäftsführung: [Name der Geschäftsführer:in]
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">Kontakt</h2>
          <dl className="mt-2 space-y-1">
            <div>
              <dt className="inline font-medium">Telefon: </dt>
              <dd className="inline">[Telefonnummer]</dd>
            </div>
            <div>
              <dt className="inline font-medium">E-Mail: </dt>
              <dd className="inline">
                <a
                  href="mailto:info@v-itness.de"
                  className="text-[hsl(var(--brand-pink))] hover:underline"
                >
                  info@v-itness.de
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Registereintrag
          </h2>
          <p className="mt-2">
            Eintragung im Handelsregister.{"\n"}
            Registergericht: [Amtsgericht]{"\n"}
            Registernummer: [HRB-Nummer]
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Umsatzsteuer-ID
          </h2>
          <p className="mt-2">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:{" "}
            [USt-IdNr.]
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="mt-2 whitespace-pre-line">
            [Name]{"\n"}
            [Anschrift]
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            EU-Streitschlichtung
          </h2>
          <p className="mt-2">
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--brand-pink))] hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            . Unsere E-Mail-Adresse findest du oben im Impressum.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Verbraucherstreitbeilegung / Universalschlichtungsstelle
          </h2>
          <p className="mt-2">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Haftung für Inhalte
          </h2>
          <p className="mt-2">
            Vitness Crew ist eine interne Plattform, ausschließlich zugänglich
            für autorisierte Mitarbeiter:innen der Vitness-Studios. Als
            Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf
            diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§
            8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
            übermittelte oder gespeicherte fremde Informationen zu überwachen
            oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen.
          </p>
        </section>
      </div>
    </main>
  );
}
