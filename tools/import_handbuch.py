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
