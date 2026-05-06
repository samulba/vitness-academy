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
        Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Anbieter
          </h2>
          <p className="mt-2 whitespace-pre-line">
            V-itness Betriebs GmbH{"\n"}
            Gietlstraße 17{"\n"}
            81541 München{"\n"}
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">Kontakt</h2>
          <dl className="mt-2 space-y-1">
            <div>
              <dt className="inline font-medium">Telefon: </dt>
              <dd className="inline">08121 99 55 0 55</dd>
            </div>
            <div>
              <dt className="inline font-medium">Fax: </dt>
              <dd className="inline">08121 99 55 0 66</dd>
            </div>
            <div>
              <dt className="inline font-medium">E-Mail: </dt>
              <dd className="inline">
                <a
                  href="mailto:info@vitness-poing.de"
                  className="text-[hsl(var(--brand-pink))] hover:underline"
                >
                  info@vitness-poing.de
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Vertretungsberechtigte Geschäftsführer
          </h2>
          <p className="mt-2">Markus Decker, Georg Pickl</p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Registereintrag
          </h2>
          <p className="mt-2 whitespace-pre-line">
            Registergericht: Amtsgericht München{"\n"}
            Registernummer: HRB 221525
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Umsatzsteuer-ID
          </h2>
          <p className="mt-2">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
            DE303999558
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <p className="mt-2">
            Markus Decker, Georg Pickl — Kontaktdaten siehe oben
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Streitschlichtung
          </h2>
          <p className="mt-2">
            Wir sind nicht bereit oder verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Haftung für Inhalte
          </h2>
          <p className="mt-2">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung
            oder Sperrung der Nutzung von Informationen nach den allgemeinen
            Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist
            jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
            Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
            Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Haftung für Links
          </h2>
          <p className="mt-2">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
            der Seiten verantwortlich. Die verlinkten Seiten wurden zum
            Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
            Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
            erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten
            Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung
            nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
            derartige Links umgehend entfernen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight">
            Urheberrecht
          </h2>
          <p className="mt-2">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht. Die
            Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
            Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht
            kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser
            Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
            Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
            gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung
            aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei
            Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte
            umgehend entfernen.
          </p>
        </section>
      </div>
    </main>
  );
}
