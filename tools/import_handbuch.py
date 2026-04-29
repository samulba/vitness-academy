#!/usr/bin/env python3
"""
Generiert supabase/seed_handbuch_inhalt.sql aus den Markdown-Files
in handbuch/. Mappt die 6 Top-Folder auf die vier bestehenden
Lernpfade. Existierende Module/Lektionen/Bloecke der vier Pfade
werden geloescht und neu angelegt.

Pro Lektion:
- 1 text-Block mit dem vollstaendigen Markdown-Body
- Optional: 1 inline_quiz-Block (handgefuellt aus FRAGEN dict --
  wenn die Lektion in dem Dict steht).

Aufruf:
    python3 tools/import_handbuch.py > supabase/seed_handbuch_inhalt.sql
"""

from __future__ import annotations
import json, os, re, uuid


ROOT = os.path.join(os.path.dirname(__file__), '..', 'handbuch')

PFAD_MAPPING: dict[str, str] = {
    "01-Magicline":         "33333333-3333-3333-3333-333333333302",
    "02-Theke-Service":     "33333333-3333-3333-3333-333333333301",
    "03-Reha":              "33333333-3333-3333-3333-333333333303",
    "04-Praeventionskurse": "33333333-3333-3333-3333-333333333303",
    "05-Trainer":           "33333333-3333-3333-3333-333333333304",
    "06-Kursplan":          "33333333-3333-3333-3333-333333333304",
}

# Module-Sort-Offset, damit Top-Folder die unter den gleichen
# Lernpfad fallen nicht ueberschneiden.
SORT_OFFSET: dict[str, int] = {
    "01-Magicline": 0,
    "02-Theke-Service": 0,
    "03-Reha": 0,
    "04-Praeventionskurse": 100,
    "05-Trainer": 0,
    "06-Kursplan": 100,
}


def clean_title(s: str) -> str:
    s = re.sub(r'^\d+-', '', s)
    s = s.replace('.md', '').replace('-', ' ')
    return s.strip()


def first_headline(md: str) -> str | None:
    m = re.search(r'^#\s+(.+)$', md, re.MULTILINE)
    return m.group(1).strip() if m else None


def det_uuid(seed: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f'vitness-academy:{seed}'))


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


def jsonb_literal(obj) -> str:
    """JSON-String, dann SQL-quote-escape fuer Postgres jsonb literal."""
    return "'" + sql_escape(json.dumps(obj, ensure_ascii=False)) + "'::jsonb"


# Hand-kuratierte Quiz-Fragen pro Lektions-Slug. Slug = Top-Folder +
# Sub + File ohne Extension. Wenn ein Slug nicht im Dict steht, gibt
# es kein Quiz fuer diese Lektion.
FRAGEN: dict[str, dict] = {
    # Magicline
    "01-Magicline/01-Was-ist-Magicline/01-Ueberblick-Funktionen-Vorteile": {
        "typ": "multiple",
        "frage": "Welche dieser Funktionen gehoeren zu Magicline?",
        "optionen": [
            {"text": "Mitgliederverwaltung mit Vertraegen und Zahlungen", "korrekt": True},
            {"text": "Termin- und Kursverwaltung", "korrekt": True},
            {"text": "Check-in-System per Chip-Band", "korrekt": True},
            {"text": "Buchhaltung und Steuererklaerung", "korrekt": False},
        ],
    },
    "01-Magicline/01-Was-ist-Magicline/02-Zugang-und-Anmeldung": {
        "typ": "single",
        "frage": "Was machst du, wenn dein Magicline-Login nicht funktioniert?",
        "optionen": [
            {"text": "Sofort neuen Account selbst anlegen", "korrekt": False},
            {"text": "Studioleitung Bescheid sagen, dann gemeinsam pruefen", "korrekt": True},
            {"text": "Mit dem Login eines Kollegen einloggen", "korrekt": False},
        ],
    },
    "01-Magicline/02-Navigation/02-Check-In": {
        "typ": "single",
        "frage": "Ein Mitglied kann sich nicht einchecken. Was ist der erste Schritt?",
        "optionen": [
            {"text": "Mitglied bitten, den Check-in nochmal zu versuchen", "korrekt": True},
            {"text": "Mitglied direkt ohne Check-in durchwinken", "korrekt": False},
            {"text": "Studioleitung anrufen", "korrekt": False},
        ],
    },
    "01-Magicline/02-Navigation/03-Mitglieder": {
        "typ": "single",
        "frage": "Wo findest du in Magicline alle Vertragsdaten eines Mitglieds?",
        "optionen": [
            {"text": "Im Bereich Mitglieder, ueber das Profil des Mitglieds", "korrekt": True},
            {"text": "Im Bereich Verkauf", "korrekt": False},
            {"text": "Im Analytics-Dashboard", "korrekt": False},
        ],
    },
    "01-Magicline/03-Wellpass-Urbansports-Wellhub/01-Grundlagen": {
        "typ": "multiple",
        "frage": "Welche Aussagen ueber Wellpass / Urban Sports / Wellhub stimmen?",
        "optionen": [
            {"text": "Es sind externe Firmenfitness-Anbieter", "korrekt": True},
            {"text": "Mitglieder muessen sich korrekt einchecken, sonst gibt es Stress mit der Abrechnung", "korrekt": True},
            {"text": "Das sind interne Vitness-Tarife", "korrekt": False},
        ],
    },
    # Theke / Service
    "02-Theke-Service/01-Grundlagen/01-Einfuehrung-Aufgaben-Service-Mitarbeiter": {
        "typ": "multiple",
        "frage": "Welche Aufgaben gehoeren zum Service-Mitarbeiter?",
        "optionen": [
            {"text": "Mitglieder begruessen und Check-in unterstuetzen", "korrekt": True},
            {"text": "Beratung bei Tarifen und Verkauf", "korrekt": True},
            {"text": "Reinigung und Ordnung im Empfangsbereich", "korrekt": True},
            {"text": "Trainingsplaene erstellen", "korrekt": False},
        ],
    },
    "02-Theke-Service/01-Grundlagen/03-VIP-Ticket-Umgang": {
        "typ": "single",
        "frage": "Was ist der Hauptzweck eines VIP-Tickets?",
        "optionen": [
            {"text": "Wichtige Mitglieder-Anfragen festhalten und bearbeiten", "korrekt": True},
            {"text": "Probetraining anbieten", "korrekt": False},
            {"text": "Mitglieder einchecken", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/01-Clubchecks": {
        "typ": "single",
        "frage": "Wann macht man einen Clubcheck?",
        "optionen": [
            {"text": "Nur bei Beschwerden", "korrekt": False},
            {"text": "Regelmaessig waehrend der Schicht, um Sauberkeit und Ordnung zu pruefen", "korrekt": True},
            {"text": "Nur am Ende der Schicht", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/02-Check-In-Check-Out": {
        "typ": "multiple",
        "frage": "Welche Gruende koennen verhindern, dass sich ein Mitglied einchecken kann?",
        "optionen": [
            {"text": "Das Mitglied ist im Mahnlauf wegen offener Zahlungen", "korrekt": True},
            {"text": "Das Mitglied trainiert ausserhalb der Tarifzeiten", "korrekt": True},
            {"text": "Das Vitness-Band ist nicht richtig zugewiesen", "korrekt": True},
            {"text": "Das WLAN ist langsam", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/04-Beratung-und-Verkauf": {
        "typ": "single",
        "frage": "Was steht bei der Beratung im Vordergrund?",
        "optionen": [
            {"text": "Den passenden Tarif fuer die Beduerfnisse des Mitglieds finden", "korrekt": True},
            {"text": "Dem Mitglied immer den teuersten Tarif verkaufen", "korrekt": False},
            {"text": "Schnell abwickeln, weniger reden", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/11-Probetraining": {
        "typ": "single",
        "frage": "Was ist ein zentrales Ziel beim Probetraining?",
        "optionen": [
            {"text": "Ein gutes Erlebnis schaffen, damit das Probemitglied bleibt", "korrekt": True},
            {"text": "So lange wie moeglich quatschen", "korrekt": False},
            {"text": "Direkt zum Vertrag draengen", "korrekt": False},
        ],
    },
    "02-Theke-Service/03-Kundenservice/03-Schwierige-Situationen": {
        "typ": "single",
        "frage": "Ein Mitglied beschwert sich aufgebracht. Was ist der erste Schritt?",
        "optionen": [
            {"text": "Ruhig zuhoeren und Verstaendnis zeigen", "korrekt": True},
            {"text": "Sofort widersprechen", "korrekt": False},
            {"text": "Auf die Studioleitung verweisen, ohne zuzuhoeren", "korrekt": False},
        ],
    },
    # Reha
    "03-Reha/01-Grundlagen/01-Ziel-und-Zweck": {
        "typ": "single",
        "frage": "Was ist das Hauptziel des Reha-Sport-Programms?",
        "optionen": [
            {"text": "Bewegung als therapeutisches Mittel fuer Menschen mit Verordnung", "korrekt": True},
            {"text": "Allgemeines Fitnesstraining fuer alle Mitglieder", "korrekt": False},
            {"text": "Wettkampftraining", "korrekt": False},
        ],
    },
    "03-Reha/01-Grundlagen/02-Abgrenzung-Reha-vs-regulaeres-Training": {
        "typ": "multiple",
        "frage": "Was unterscheidet Reha-Sport vom regulaeren Training?",
        "optionen": [
            {"text": "Reha braucht eine aerztliche Verordnung", "korrekt": True},
            {"text": "Reha laeuft in festen Kursen mit qualifizierten Uebungsleiter:innen", "korrekt": True},
            {"text": "Beim regulaeren Training trainiert man immer alleine", "korrekt": False},
        ],
    },
    "03-Reha/02-Ablauf/01-Erstkontakt-und-Anmeldung": {
        "typ": "single",
        "frage": "Was machst du bei einem Erstkontakt fuer Reha-Sport?",
        "optionen": [
            {"text": "Anfrage strukturiert aufnehmen, Kontaktdaten + Verordnung pruefen", "korrekt": True},
            {"text": "Sofort einen Termin geben, Verordnung spaeter klaeren", "korrekt": False},
            {"text": "Ablehnen, wenn die Person nicht Mitglied ist", "korrekt": False},
        ],
    },
    "03-Reha/04-Reha-Fit-Programm/02-Krankenkasse-funktioniert-nicht": {
        "typ": "single",
        "frage": "Die Krankenkassen-Karte des Reha-Teilnehmers wird nicht gelesen. Was tust du zuerst?",
        "optionen": [
            {"text": "Karte erneut sauber einlesen, ggf. manuelle Erfassung", "korrekt": True},
            {"text": "Teilnehmer wegschicken", "korrekt": False},
            {"text": "Probetraining anbieten", "korrekt": False},
        ],
    },
    # Praevention
    "04-Praeventionskurse/01-Grundlagen": {
        "typ": "single",
        "frage": "Was ist die rechtliche Grundlage der Praeventionskurse?",
        "optionen": [
            {"text": "Paragraph 20 SGB V", "korrekt": True},
            {"text": "DSGVO", "korrekt": False},
            {"text": "Arbeitsschutzgesetz", "korrekt": False},
        ],
    },
    "04-Praeventionskurse/04-Dokumente-richtig-ausfuellen": {
        "typ": "multiple",
        "frage": "Was ist beim Ausfuellen der Praeventions-Dokumente wichtig?",
        "optionen": [
            {"text": "Vollstaendige Daten des Teilnehmers", "korrekt": True},
            {"text": "Korrekte Kursbezeichnung und Termine", "korrekt": True},
            {"text": "Unterschrift wo benoetigt", "korrekt": True},
            {"text": "Abkuerzungen wo immer moeglich", "korrekt": False},
        ],
    },
    # Trainer
    "05-Trainer/02-Trainingsqualitaet-Methodik": {
        "typ": "single",
        "frage": "Was sichert eine hohe Trainingsqualitaet?",
        "optionen": [
            {"text": "Standardisierte Methodik + individuelle Anpassung an das Mitglied", "korrekt": True},
            {"text": "Jeden Trainer machen lassen, was er fuer richtig haelt", "korrekt": False},
            {"text": "Immer das gleiche Training fuer alle", "korrekt": False},
        ],
    },
    "05-Trainer/03-Standardisierter-Terminprozess": {
        "typ": "single",
        "frage": "Warum gibt es einen standardisierten Terminprozess?",
        "optionen": [
            {"text": "Damit jeder Trainer Termine in gleicher Qualitaet durchfuehrt", "korrekt": True},
            {"text": "Damit Trainer schneller fertig werden", "korrekt": False},
            {"text": "Wegen Buchhaltung", "korrekt": False},
        ],
    },
    "05-Trainer/05-VIP-Start-Standardisierung": {
        "typ": "single",
        "frage": "Was ist der VIP-Start?",
        "optionen": [
            {"text": "Der standardisierte Onboarding-Prozess fuer neue Mitglieder", "korrekt": True},
            {"text": "Ein Premium-Vertrag", "korrekt": False},
            {"text": "Ein Probetraining", "korrekt": False},
        ],
    },
    # Kursplan
    "06-Kursplan/00-Kursplan-Komplett": {
        "typ": "single",
        "frage": "Wo findest du den aktuellen Kursplan?",
        "optionen": [
            {"text": "Im Magicline unter Kurse — und im Aushang im Studio", "korrekt": True},
            {"text": "Nur am schwarzen Brett", "korrekt": False},
            {"text": "Den gibt es nur muendlich", "korrekt": False},
        ],
    },

    # --- Erweiterte Fragen-Sammlung -----------------------------------
    # Magicline weitere Module
    "01-Magicline/02-Navigation/01-Dashboard": {
        "typ": "single",
        "frage": "Wofuer dient das Dashboard in Magicline?",
        "optionen": [
            {"text": "Schneller Ueberblick ueber Kennzahlen, anstehende Termine und Aktivitaeten", "korrekt": True},
            {"text": "Zum Erstellen von Trainingsplaenen", "korrekt": False},
            {"text": "Zum Drucken von Vertraegen", "korrekt": False},
        ],
    },
    "01-Magicline/02-Navigation/04-Termine": {
        "typ": "multiple",
        "frage": "Was kannst du im Termine-Bereich machen?",
        "optionen": [
            {"text": "Termine pro Mitarbeiter und Tag einsehen", "korrekt": True},
            {"text": "Neue Termine eintragen und absagen", "korrekt": True},
            {"text": "Standort wechseln, um Termine an anderen Standorten zu sehen", "korrekt": True},
            {"text": "Mitgliedsbeitraege ueberweisen", "korrekt": False},
        ],
    },
    "01-Magicline/02-Navigation/05-Kurse": {
        "typ": "single",
        "frage": "Wo siehst du, welche Kurse heute im Studio stattfinden?",
        "optionen": [
            {"text": "Im Bereich Kurse in Magicline", "korrekt": True},
            {"text": "Nur im Mitglieder-Profil", "korrekt": False},
            {"text": "Im Verkaufs-Bereich", "korrekt": False},
        ],
    },
    "01-Magicline/02-Navigation/06-Analytics": {
        "typ": "single",
        "frage": "Welche Information liefert dir der Analytics-Bereich primaer?",
        "optionen": [
            {"text": "Kennzahlen zu Auslastung, Mitgliederbewegung und Umsatz", "korrekt": True},
            {"text": "Den Putzplan", "korrekt": False},
            {"text": "Die Reinigungsprotokolle", "korrekt": False},
        ],
    },
    "01-Magicline/02-Navigation/08-Hilfe-und-Support": {
        "typ": "single",
        "frage": "Wo schaust du zuerst, wenn du nicht weiterkommst?",
        "optionen": [
            {"text": "Im Hilfe- und Support-Bereich von Magicline", "korrekt": True},
            {"text": "Mitgliedern direkt von der Frage erzaehlen", "korrekt": False},
            {"text": "Den Termin einfach absagen", "korrekt": False},
        ],
    },
    "01-Magicline/03-Wellpass-Urbansports-Wellhub/02-Wellpass-Mitglieder": {
        "typ": "multiple",
        "frage": "Was gilt beim Check-in eines Wellpass-Mitglieds?",
        "optionen": [
            {"text": "Das Mitglied checkt sich mit QR-Code in der App ein", "korrekt": True},
            {"text": "Es bekommt ein Tagesgastband, ggf. gegen Pfand", "korrekt": True},
            {"text": "Wir buchen den Besuch im Magicline ueber Aggregator-Mitglied hinzufuegen", "korrekt": True},
            {"text": "Es zahlt jedes Mal in bar", "korrekt": False},
        ],
    },
    "01-Magicline/03-Wellpass-Urbansports-Wellhub/03-Urban-Sports-Mitglieder": {
        "typ": "single",
        "frage": "Wie wird ein Urban-Sports-Check-in korrekt erfasst?",
        "optionen": [
            {"text": "Ueber den Check-in-Code aus der Urban-Sports-App im Aggregator-Bereich", "korrekt": True},
            {"text": "Manuell als Vitness-Mitglied", "korrekt": False},
            {"text": "Ueber einen normalen Tagesgast-Eintrag", "korrekt": False},
        ],
    },
    # Theke / Service Erweiterung
    "02-Theke-Service/01-Grundlagen/02-Ziele-und-Standards": {
        "typ": "multiple",
        "frage": "Welche Ziele verfolgt der Service-Bereich?",
        "optionen": [
            {"text": "Hohe Mitgliederzufriedenheit", "korrekt": True},
            {"text": "Sauberer und ordentlicher Empfangsbereich", "korrekt": True},
            {"text": "Konsistente Servicequalitaet ueber alle Schichten", "korrekt": True},
            {"text": "Moeglichst wenig Kontakt mit Mitgliedern", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/03-Telefon-und-E-Mails": {
        "typ": "single",
        "frage": "Wie meldest du dich am Telefon korrekt?",
        "optionen": [
            {"text": "Mit Studio-Name + eigenem Namen + freundlicher Begruessung", "korrekt": True},
            {"text": "Nur mit 'Hallo'", "korrekt": False},
            {"text": "Mit Vornamen, ohne Studio-Bezug", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/09-Walk-In": {
        "typ": "multiple",
        "frage": "Was ist beim Walk-In wichtig?",
        "optionen": [
            {"text": "Innerhalb der ersten 60 Sekunden ein guter Eindruck", "korrekt": True},
            {"text": "Beduerfnisse erfragen, dann individuell fuehren", "korrekt": True},
            {"text": "Idealerweise direkt einen Termin oder Probetraining vereinbaren", "korrekt": True},
            {"text": "Sofort den teuersten Vertrag verkaufen", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/10-Interessenten-Anrufen": {
        "typ": "single",
        "frage": "Was ist das Ziel beim Anrufen von Interessenten?",
        "optionen": [
            {"text": "Beziehung aufbauen, Beduerfnis klaeren und einen Folgetermin vereinbaren", "korrekt": True},
            {"text": "Dem Interessenten den Tarif diktieren", "korrekt": False},
            {"text": "So schnell wie moeglich aufzulegen", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/12-Baender-zuweisen": {
        "typ": "single",
        "frage": "Was muss beim Zuweisen eines V-itness-Bands stimmen?",
        "optionen": [
            {"text": "Das Band ist eindeutig dem korrekten Mitglieds-Profil zugeordnet", "korrekt": True},
            {"text": "Es ist egal, welches Band das Mitglied bekommt", "korrekt": False},
            {"text": "Mehrere Mitglieder duerfen sich ein Band teilen", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/14-Reinigungsprotokoll": {
        "typ": "single",
        "frage": "Wozu dient das Reinigungsprotokoll?",
        "optionen": [
            {"text": "Nachweis und Konsistenz darueber, was wann gereinigt wurde", "korrekt": True},
            {"text": "Es ist nur eine optionale Notiz", "korrekt": False},
            {"text": "Wir benutzen es nur bei Beschwerden", "korrekt": False},
        ],
    },
    "02-Theke-Service/02-Taegliche-Arbeitsablaeufe/16-Putzplan": {
        "typ": "single",
        "frage": "Wer ist verantwortlich, dass die Aufgaben im Putzplan erledigt werden?",
        "optionen": [
            {"text": "Alle Service-Mitarbeiter waehrend der Schicht", "korrekt": True},
            {"text": "Nur die Studioleitung", "korrekt": False},
            {"text": "Externe Reinigung allein", "korrekt": False},
        ],
    },
    "02-Theke-Service/03-Kundenservice/02-Kommunikation": {
        "typ": "multiple",
        "frage": "Was ist gute Kommunikation mit Kunden?",
        "optionen": [
            {"text": "Persoenliche, freundliche Begruessung mit Namen wenn moeglich", "korrekt": True},
            {"text": "Aktives Zuhoeren und Paraphrasieren", "korrekt": True},
            {"text": "Loesungsorientierte Sprache statt 'das geht nicht'", "korrekt": True},
            {"text": "Waehrend des Gespraechs aufs Handy schauen", "korrekt": False},
        ],
    },
    "02-Theke-Service/03-Kundenservice/04-Kundenbindung": {
        "typ": "single",
        "frage": "Was wirkt am staerksten auf Kundenbindung?",
        "optionen": [
            {"text": "Echtes Interesse, persoenlicher Bezug und konstante Servicequalitaet", "korrekt": True},
            {"text": "Hauptsache niedrigster Preis", "korrekt": False},
            {"text": "Kunden ignorieren, sobald sie unterschrieben haben", "korrekt": False},
        ],
    },
    "02-Theke-Service/04-Rechtliche-Aspekte/01-Rechtliche-Grundlagen": {
        "typ": "multiple",
        "frage": "Was musst du rechtlich beachten?",
        "optionen": [
            {"text": "Datenschutz (DSGVO) bei Mitgliedsdaten", "korrekt": True},
            {"text": "Kein Weitergeben persoenlicher Daten an Dritte", "korrekt": True},
            {"text": "Vertragsformalitaeten korrekt einhalten", "korrekt": True},
            {"text": "Mitgliedsdaten gerne in WhatsApp-Gruppen teilen", "korrekt": False},
        ],
    },
    # Reha Erweiterung
    "03-Reha/01-Grundlagen/03-Rechtliche-Grundlagen": {
        "typ": "single",
        "frage": "Was ist die rechtliche Grundlage des Reha-Sports?",
        "optionen": [
            {"text": "Rahmenvereinbarung Rehabilitationssport (BAR) und SGB IX", "korrekt": True},
            {"text": "DSGVO", "korrekt": False},
            {"text": "Steuerrecht", "korrekt": False},
        ],
    },
    "03-Reha/02-Ablauf/02-VO-abgelaufen": {
        "typ": "multiple",
        "frage": "Was gilt, wenn die Reha-Verordnung abgelaufen ist?",
        "optionen": [
            {"text": "Fuer eine erneute Teilnahme braucht es eine neue Verordnung", "korrekt": True},
            {"text": "Privat Versicherte muessen die Kosten erneut tragen", "korrekt": True},
            {"text": "Bei nicht ausgeschoepften Stunden kann eine Verlaengerung beantragt werden", "korrekt": True},
            {"text": "Der Teilnehmer kann unbegrenzt einfach weitermachen", "korrekt": False},
        ],
    },
    "03-Reha/03-Verordnungen/01-Krankenkasse": {
        "typ": "single",
        "frage": "Was machst du mit einer Reha-Verordnung der gesetzlichen Krankenkasse?",
        "optionen": [
            {"text": "Vollstaendigkeit pruefen, im System erfassen, dem Reha-Programm zuordnen", "korrekt": True},
            {"text": "Direkt an Mitglied zurueckgeben ohne Pruefung", "korrekt": False},
            {"text": "An eine andere Krankenkasse weiterleiten", "korrekt": False},
        ],
    },
    "03-Reha/04-Reha-Fit-Programm/01-Tagesliste-Teilnehmer": {
        "typ": "single",
        "frage": "Wozu dient die Tagesliste der Reha-Teilnehmer?",
        "optionen": [
            {"text": "Anwesenheit dokumentieren und der Kurs-Abrechnung zuordnen", "korrekt": True},
            {"text": "Mitgliederwerbung", "korrekt": False},
            {"text": "Marketing-Kampagne", "korrekt": False},
        ],
    },
    "03-Reha/04-Reha-Fit-Programm/05-Reha-Kurs-absagen": {
        "typ": "single",
        "frage": "Ein Reha-Kurs muss kurzfristig abgesagt werden. Was tust du?",
        "optionen": [
            {"text": "Teilnehmer rechtzeitig informieren, im System dokumentieren, Ersatztermin anbieten", "korrekt": True},
            {"text": "Niemandem Bescheid geben", "korrekt": False},
            {"text": "Den Kurs einfach so weiterlaufen lassen", "korrekt": False},
        ],
    },
    # Praevention Erweiterung
    "04-Praeventionskurse/02-FeelFit-Grundlagen": {
        "typ": "single",
        "frage": "Was ist FeelFit?",
        "optionen": [
            {"text": "Ein Praeventionskurs nach Paragraph 20 SGB V mit Fokus auf Bewegung", "korrekt": True},
            {"text": "Ein Personal-Trainer-Tarif", "korrekt": False},
            {"text": "Ein Reha-Geraet", "korrekt": False},
        ],
    },
    "04-Praeventionskurse/03-Yummy-Grundlagen": {
        "typ": "single",
        "frage": "Welchen Schwerpunkt hat der Yummy-Kurs?",
        "optionen": [
            {"text": "Ernaehrung und gesunde Lebensweise als Praeventionskurs", "korrekt": True},
            {"text": "Reines Krafttraining", "korrekt": False},
            {"text": "Wellpass-Vermarktung", "korrekt": False},
        ],
    },
    # Trainer Erweiterung
    "05-Trainer/01-Umsatz-Unternehmensziele": {
        "typ": "single",
        "frage": "Welche Rolle spielt der Trainer fuer die Unternehmensziele?",
        "optionen": [
            {"text": "Trainerleistungen sind direkt mit Mitgliederzufriedenheit, Bindung und Umsatz verknuepft", "korrekt": True},
            {"text": "Trainer haben mit Umsatz nichts zu tun", "korrekt": False},
            {"text": "Trainer sind nur fuer die Reinigung zustaendig", "korrekt": False},
        ],
    },
    "05-Trainer/04-Trainer-Staerken-Verantwortlichkeiten": {
        "typ": "multiple",
        "frage": "Was gehoert zu deinen Verantwortlichkeiten als Trainer?",
        "optionen": [
            {"text": "Sicheres und korrektes Training anleiten", "korrekt": True},
            {"text": "Auf individuelle Bedarfe und Einschraenkungen eingehen", "korrekt": True},
            {"text": "Fortschritt dokumentieren und kommunizieren", "korrekt": True},
            {"text": "Trainingsdaten von Mitgliedern oeffentlich teilen", "korrekt": False},
        ],
    },
    "05-Trainer/06-Starttermin": {
        "typ": "multiple",
        "frage": "Was MUSS beim Starttermin passieren?",
        "optionen": [
            {"text": "Vollstaendige Anamnese", "korrekt": True},
            {"text": "Inbody-Messung als Ausgangsbasis", "korrekt": True},
            {"text": "Erste Egym-Einstellung", "korrekt": True},
            {"text": "Sofort Vertragserweiterung verkaufen", "korrekt": False},
        ],
    },
}


# ----------------------------------------------------------------------
# Datensammeln
# ----------------------------------------------------------------------
class Modul:
    def __init__(self, id_: str, titel: str, sort: int, pfad_id: str):
        self.id = id_
        self.titel = titel
        self.sort = sort
        self.pfad_id = pfad_id
        self.lektionen: list["Lektion"] = []


class Lektion:
    def __init__(
        self, id_: str, titel: str, sort: int, modul_id: str, body: str, slug: str
    ):
        self.id = id_
        self.titel = titel
        self.sort = sort
        self.modul_id = modul_id
        self.body = body
        self.slug = slug


pfad_module: dict[str, list[Modul]] = {pid: [] for pid in set(PFAD_MAPPING.values())}


for top_folder in sorted(PFAD_MAPPING.keys()):
    top_path = os.path.join(ROOT, top_folder)
    if not os.path.isdir(top_path):
        continue
    pfad_id = PFAD_MAPPING[top_folder]
    base_offset = SORT_OFFSET.get(top_folder, 0)

    subdirs = sorted(
        d for d in os.listdir(top_path) if os.path.isdir(os.path.join(top_path, d))
    )
    toplevel_files = sorted(
        f
        for f in os.listdir(top_path)
        if f.endswith('.md') and not f.startswith('00-INDEX') and f != 'README.md'
    )

    if subdirs:
        for i, sd in enumerate(subdirs):
            modul_titel = clean_title(sd)
            modul_id = det_uuid(f'modul:{top_folder}/{sd}')
            modul = Modul(modul_id, modul_titel, base_offset + i + 1, pfad_id)
            sd_path = os.path.join(top_path, sd)
            files = sorted(f for f in os.listdir(sd_path) if f.endswith('.md'))
            for j, f in enumerate(files):
                fp = os.path.join(sd_path, f)
                with open(fp, 'r', encoding='utf-8') as fh:
                    body = fh.read().strip()
                titel = first_headline(body) or clean_title(f)
                slug = f"{top_folder}/{sd}/{f.replace('.md', '')}"
                lid = det_uuid(f'lektion:{slug}')
                modul.lektionen.append(
                    Lektion(lid, titel, j + 1, modul_id, body, slug)
                )
            pfad_module[pfad_id].append(modul)
    elif toplevel_files:
        modul_titel = clean_title(top_folder)
        modul_id = det_uuid(f'modul:{top_folder}')
        modul = Modul(modul_id, modul_titel, base_offset + 1, pfad_id)
        for j, f in enumerate(toplevel_files):
            fp = os.path.join(top_path, f)
            with open(fp, 'r', encoding='utf-8') as fh:
                body = fh.read().strip()
            titel = first_headline(body) or clean_title(f)
            slug = f"{top_folder}/{f.replace('.md', '')}"
            lid = det_uuid(f'lektion:{slug}')
            modul.lektionen.append(
                Lektion(lid, titel, j + 1, modul_id, body, slug)
            )
        pfad_module[pfad_id].append(modul)


# ----------------------------------------------------------------------
# SQL ausgeben
# ----------------------------------------------------------------------
PFAD_IDS = sorted(set(PFAD_MAPPING.values()))

print("-- =========================================================")
print("-- seed_handbuch_inhalt.sql  (auto-generated)")
print("-- Quelle: handbuch/*.md")
print("-- =========================================================")
print("")
print("begin;")
print("")
print("-- 1) Bestehende Module der vier Pfade loeschen (cascade auf")
print("--    lessons + lesson_content_blocks + Quiz-Versuche).")
print("delete from public.modules where learning_path_id in (")
print(",\n".join(f"  '{p}'" for p in PFAD_IDS))
print(");")
print("")

# Module
modul_rows: list[str] = []
for pid in PFAD_IDS:
    for m in pfad_module[pid]:
        modul_rows.append(
            f"  ('{m.id}', '{m.pfad_id}', '{sql_escape(m.titel)}', "
            f"{m.sort})"
        )
print("-- 2) Module")
print("insert into public.modules (id, learning_path_id, title, sort_order) values")
print(",\n".join(modul_rows) + ";")
print("")

# Lektionen
lekt_rows: list[str] = []
for pid in PFAD_IDS:
    for m in pfad_module[pid]:
        for l in m.lektionen:
            lekt_rows.append(
                f"  ('{l.id}', '{m.id}', '{sql_escape(l.titel)}', "
                f"{l.sort})"
            )
print("-- 3) Lektionen")
print("insert into public.lessons (id, module_id, title, sort_order) values")
print(",\n".join(lekt_rows) + ";")
print("")

# Inhalts-Bloecke
block_rows: list[str] = []
for pid in PFAD_IDS:
    for m in pfad_module[pid]:
        for l in m.lektionen:
            text_id = det_uuid(f'block:text:{l.id}')
            text_content = jsonb_literal({"markdown": l.body})
            block_rows.append(
                f"  ('{text_id}', '{l.id}', 'text', {text_content}, 1)"
            )
            quiz = FRAGEN.get(l.slug)
            if quiz:
                quiz_id = det_uuid(f'block:quiz:{l.id}')
                quiz_content = jsonb_literal(quiz)
                block_rows.append(
                    f"  ('{quiz_id}', '{l.id}', 'inline_quiz', {quiz_content}, 100)"
                )

print("-- 4) Inhalts-Bloecke (Text + optionales inline_quiz)")
print("insert into public.lesson_content_blocks (id, lesson_id, block_type, content, sort_order) values")
print(",\n".join(block_rows) + ";")
print("")
print("commit;")
