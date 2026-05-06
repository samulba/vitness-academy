import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Datenschutzerklärung · Vitness Crew",
  robots: { index: true, follow: false },
};

export default function DatenschutzPage() {
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
        Datenschutzerklärung
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Stand: {new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long" })}
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            1. Verantwortlicher
          </h2>
          <p className="mt-2 whitespace-pre-line">
            Verantwortlich für die Datenverarbeitung im Rahmen dieser Plattform
            ist der im Impressum genannte Anbieter:{"\n"}
            V-itness Betriebs GmbH{"\n"}
            Gietlstraße 17{"\n"}
            81541 München{"\n"}
            Telefon: 08121 99 55 0 55{"\n"}
            E-Mail:{" "}
            <a
              href="mailto:info@vitness-poing.de"
              className="text-[hsl(var(--brand-pink))] hover:underline"
            >
              info@vitness-poing.de
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            2. Allgemeines &amp; Geltungsbereich
          </h2>
          <p className="mt-2">
            Vitness Crew ist eine interne Plattform für autorisierte
            Mitarbeiter:innen der Vitness-Studios. Wir verarbeiten
            personenbezogene Daten ausschließlich zur Bereitstellung des
            Dienstes (Schulungen, Aufgaben, Kommunikation, Verwaltung) und
            nur in dem Umfang, der für das Arbeitsverhältnis und die
            innerbetriebliche Organisation notwendig ist (Art. 6 Abs. 1 lit. b
            und f DSGVO, § 26 BDSG).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            3. Welche Daten wir verarbeiten
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Stammdaten:</strong> Name, dienstliche E-Mail, Telefon,
              Rolle, zugeordneter Standort, optional Profilbild.
            </li>
            <li>
              <strong>Vertragsdaten:</strong> Eintritts-/Austrittsdatum,
              Vertragsart, Wochenstunden, Personalnummer.
            </li>
            <li>
              <strong>Lerndaten:</strong> Fortschritt in Lernpfaden, Quiz-Versuche,
              abgeschlossene Lektionen, Onboarding-Status.
            </li>
            <li>
              <strong>Aktivitätsdaten:</strong> Aufgaben, gemeldete Mängel,
              eingereichte Anfragen, gepostete Infos, erfasstes
              Mitglieder-Feedback, Kudos.
            </li>
            <li>
              <strong>Provisions-/Lohndaten:</strong> erfasste Abschlüsse,
              berechnete Provisionen, Auszahlungsstatus (nur sichtbar für
              Vertriebler:innen und Studioleitung).
            </li>
            <li>
              <strong>Technische Daten:</strong> Zeitstempel, IP-Adresse beim
              Login (durch Supabase Auth), User-Agent. Diese Daten werden zur
              Sicherstellung des Betriebs und zur Missbrauchserkennung verwendet.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            4. Auftragsverarbeitung &amp; eingesetzte Dienste
          </h2>
          <p className="mt-2">
            Zum Betrieb der Plattform setzen wir folgende Auftragsverarbeiter
            ein. Mit allen genannten Anbietern bestehen Verträge zur
            Auftragsverarbeitung gemäß Art. 28 DSGVO.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA
              91723, USA — Hosting der Anwendung. Server-Standort EU.
            </li>
            <li>
              <strong>Supabase Inc.</strong>, 970 Toa Payoh North #07-04,
              Singapur 318992 — Datenbank, Authentifizierung, File-Storage.
              Daten werden in der EU gespeichert.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">5. Cookies</h2>
          <p className="mt-2">
            Vitness Crew verwendet ausschließlich technisch notwendige Cookies
            (Session-Cookie für die Anmeldung, Cookie für die Speicherung des
            aktiven Standorts und der Theme-Auswahl). Es findet kein
            Tracking, kein Marketing-Cookie und keine Weitergabe an Dritte zu
            Werbezwecken statt. Eine Einwilligung ist nach § 25 Abs. 2 Nr. 2
            TTDSG nicht erforderlich.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            6. Speicherdauer
          </h2>
          <p className="mt-2">
            Personenbezogene Daten werden so lange gespeichert, wie sie für die
            Erfüllung des Arbeitsverhältnisses erforderlich sind. Nach
            Beendigung des Arbeitsverhältnisses wird das Konto archiviert
            (Login wird gesperrt) und nach den gesetzlichen
            Aufbewahrungsfristen (z. B. 6 Jahre nach § 257 HGB,
            10 Jahre nach § 147 AO bei steuerrelevanten Provisionsdaten)
            gelöscht oder anonymisiert.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            7. Deine Rechte
          </h2>
          <p className="mt-2">
            Du hast jederzeit das Recht auf:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Auskunft über die zu deiner Person gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>
              Löschung deiner Daten, soweit keine gesetzlichen
              Aufbewahrungspflichten entgegenstehen (Art. 17 DSGVO)
            </li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            <li>
              Beschwerde bei der zuständigen Aufsichtsbehörde (Art. 77 DSGVO).
              In Bayern: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA),
              Promenade 18, 91522 Ansbach.
            </li>
          </ul>
          <p className="mt-3">
            Wende dich für alle Auskunfts- und Löschanfragen an{" "}
            <a
              href="mailto:info@vitness-poing.de"
              className="text-[hsl(var(--brand-pink))] hover:underline"
            >
              info@vitness-poing.de
            </a>{" "}
            oder direkt an die Studioleitung.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            8. Datensicherheit
          </h2>
          <p className="mt-2">
            Die Übertragung erfolgt ausschließlich verschlüsselt (TLS).
            Zugriffe sind rollenbasiert eingeschränkt (Row-Level-Security in
            der Datenbank). Mitarbeiter:innen sehen nur die Daten, die für
            ihre Rolle notwendig sind. Mängel-Fotos und Datei-Uploads werden
            in einem zugriffsbeschränkten Storage abgelegt.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            9. Änderungen dieser Datenschutzerklärung
          </h2>
          <p className="mt-2">
            Diese Datenschutzerklärung wird bei wesentlichen Änderungen der
            Plattform oder der eingesetzten Dienste angepasst. Die jeweils
            aktuelle Fassung ist über den Footer der Plattform abrufbar.
          </p>
        </section>
      </div>
    </main>
  );
}
