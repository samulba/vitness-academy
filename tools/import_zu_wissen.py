#!/usr/bin/env python3
"""
Initial-Importer: alle 72 Markdown-Dateien aus handbuch/* in die
Wissens-Datenbank (knowledge_categories + knowledge_articles) laden.

Mapping:
- Top-Folder (z.B. "01-Magicline") -> 1 knowledge_category
- Jede *.md-Datei -> 1 knowledge_article (Markdown-Body bleibt erhalten)
- Title: erste H1 im Markdown, Fallback: Filename
- Summary: erster nicht-leerer Absatz nach H1, max. 220 Zeichen
- Body: kompletter Markdown-Inhalt (inkl. H1 -- damit Print-Vorschau geht)
- Slug: deterministisch aus Pfad, eindeutig
- sort_order: aus Filename-Prefix (01-, 02-, ... bzw. Folder-Index *100)

Verhalten beim Re-Run:
- DELETE der bestehenden Demo-Inhalte (alte Seed-Daten, max. eine
  Handvoll Artikel)
- INSERT der frisch importierten Inhalte mit deterministischen UUIDs
- Bei zweitem Run: bestehende Notion-Inhalte werden ueberschrieben
  (UPSERT). ACHTUNG: Admin-UI-Aenderungen an diesen Artikeln gehen
  beim Re-Run verloren -- nur ausfuehren bei initialem Import oder
  wenn Notion-Inhalte komplett neu sind.

Aufruf:
    python3 tools/import_zu_wissen.py > supabase/seed_handbuch_zu_wissen.sql
"""

from __future__ import annotations
import os
import re
import uuid


ROOT = os.path.join(os.path.dirname(__file__), "..", "handbuch")


# Top-Folder -> Kategorie-Definitionen
KATEGORIEN: list[dict] = [
    {
        "folder": "01-Magicline",
        "name": "Magicline",
        "slug": "magicline",
        "description": "Häufige Vorgänge im Magicline-System.",
    },
    {
        "folder": "02-Theke-Service",
        "name": "Theke und Service",
        "slug": "theke",
        "description": "Standardabläufe an der Theke und am Empfang.",
    },
    {
        "folder": "03-Reha",
        "name": "Reha",
        "slug": "reha",
        "description": "Aufnahme und Begleitung von Reha-Anfragen.",
    },
    {
        "folder": "04-Praeventionskurse",
        "name": "Präventionskurse",
        "slug": "praevention",
        "description": "FeelFit, Yummy und §20 SGB V.",
    },
    {
        "folder": "05-Trainer",
        "name": "Trainer",
        "slug": "trainer",
        "description": "Trainingsqualität, Methodik, Standards.",
    },
    {
        "folder": "06-Kursplan",
        "name": "Kursplan",
        "slug": "kursplan",
        "description": "Kurse, Termine und Kursinformationen.",
    },
]


def det_uuid(seed: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"vitness-academy:wissen:{seed}"))


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


def clean_title_from_filename(name: str) -> str:
    # "03-VIP-Ticket-Umgang.md" -> "VIP Ticket Umgang"
    s = re.sub(r"^\d+[-_]?", "", name)
    s = s.replace(".md", "")
    s = s.replace("-", " ").replace("_", " ")
    return s.strip()


def first_h1(md: str) -> str | None:
    m = re.search(r"^#\s+(.+)$", md, re.MULTILINE)
    return m.group(1).strip() if m else None


def first_paragraph_after_h1(md: str) -> str:
    """Erster nicht-leerer Absatz nach der H1, gestrippt von Markdown-Syntax."""
    lines = md.splitlines()
    started = False
    buf: list[str] = []
    for line in lines:
        if line.startswith("# "):
            started = True
            continue
        if not started:
            continue
        if line.startswith("##"):
            break
        stripped = line.strip()
        if not stripped and buf:
            break
        if stripped and not stripped.startswith("#"):
            # Markdown weg: **fett**, *kursiv*, [text](url) -> text
            stripped = re.sub(r"\*\*(.+?)\*\*", r"\1", stripped)
            stripped = re.sub(r"\*(.+?)\*", r"\1", stripped)
            stripped = re.sub(r"`([^`]+)`", r"\1", stripped)
            stripped = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", stripped)
            buf.append(stripped)
    text = " ".join(buf)
    if len(text) > 220:
        text = text[:217].rstrip() + "…"
    return text


def slugify(s: str) -> str:
    s = s.lower()
    s = (
        s.replace("ä", "ae")
        .replace("ö", "oe")
        .replace("ü", "ue")
        .replace("ß", "ss")
    )
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "artikel"


# ----------------------------------------------------------------------
# Sammeln
# ----------------------------------------------------------------------
class Article:
    def __init__(
        self,
        id_: str,
        category_id: str,
        title: str,
        slug: str,
        summary: str,
        body: str,
        sort_order: int,
    ):
        self.id = id_
        self.category_id = category_id
        self.title = title
        self.slug = slug
        self.summary = summary
        self.body = body
        self.sort_order = sort_order


articles: list[Article] = []
seen_slugs: set[str] = set()


def unique_slug(base: str) -> str:
    slug = base
    n = 2
    while slug in seen_slugs:
        slug = f"{base}-{n}"
        n += 1
    seen_slugs.add(slug)
    return slug


def collect_md_files(folder: str) -> list[tuple[str, str]]:
    """Liefert (relativer-Pfad, voller-Pfad) sortiert nach Pfad."""
    out: list[tuple[str, str]] = []
    for dirpath, _, files in os.walk(folder):
        for f in files:
            if f.endswith(".md") and f != "README.md":
                full = os.path.join(dirpath, f)
                rel = os.path.relpath(full, folder)
                out.append((rel, full))
    out.sort(key=lambda x: x[0])
    return out


for cat_idx, kat in enumerate(KATEGORIEN):
    folder_path = os.path.join(ROOT, kat["folder"])
    if not os.path.isdir(folder_path):
        continue
    cat_id = det_uuid(f"category:{kat['slug']}")
    kat["id"] = cat_id

    md_files = collect_md_files(folder_path)
    for art_idx, (rel, full) in enumerate(md_files):
        with open(full, "r", encoding="utf-8") as fh:
            md = fh.read()
        h1 = first_h1(md)
        title = h1 or clean_title_from_filename(os.path.basename(rel))
        summary = first_paragraph_after_h1(md)
        slug_seed = f"{kat['slug']}-{slugify(rel.replace(os.sep, '-'))}"
        slug = unique_slug(slugify(slug_seed))
        article_id = det_uuid(f"article:{kat['slug']}:{rel}")

        # sort_order: 1000*cat + 10*sub_index + position-in-folder
        sort_order = (cat_idx + 1) * 10000 + art_idx

        articles.append(
            Article(
                id_=article_id,
                category_id=cat_id,
                title=title.strip(),
                slug=slug,
                summary=summary,
                body=md,
                sort_order=sort_order,
            )
        )


# ----------------------------------------------------------------------
# SQL ausgeben
# ----------------------------------------------------------------------
print("-- =========================================================")
print("-- seed_handbuch_zu_wissen.sql  (auto-generated)")
print("-- Quelle: handbuch/*.md")
print(f"-- Kategorien: {len(KATEGORIEN)} | Artikel: {len(articles)}")
print("-- ")
print("-- ACHTUNG: Loescht alle bestehenden knowledge_articles + ")
print("-- knowledge_categories und legt sie aus den Notion-MD frisch an.")
print("-- Beim Re-Run gehen Admin-UI-Aenderungen an diesen Artikeln")
print("-- verloren. Nicht regelmaessig laufen lassen -- nach Initial-")
print("-- Import wird alles ueber das Admin-UI gepflegt.")
print("-- =========================================================")
print()
print("begin;")
print()
print("-- 1) Bestehende Inhalte loeschen")
print("delete from public.knowledge_articles;")
print("delete from public.knowledge_categories;")
print()
print("-- 2) Kategorien")
print(
    "insert into public.knowledge_categories "
    "(id, name, slug, description, sort_order) values"
)
parts = []
for i, k in enumerate(KATEGORIEN):
    parts.append(
        f"  ('{k['id']}', '{sql_escape(k['name'])}', "
        f"'{sql_escape(k['slug'])}', '{sql_escape(k['description'])}', {i})"
    )
print(",\n".join(parts) + ";")
print()
print("-- 3) Artikel")
for a in articles:
    print(
        "insert into public.knowledge_articles "
        "(id, category_id, title, slug, summary, body, status, sort_order)"
    )
    print(
        f"values ('{a.id}', '{a.category_id}', "
        f"'{sql_escape(a.title)}', '{sql_escape(a.slug)}', "
        f"'{sql_escape(a.summary)}', $body${a.body}$body$, "
        f"'aktiv', {a.sort_order});"
    )
print()
print("commit;")
