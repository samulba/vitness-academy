"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import type { Notiz } from "@/lib/mitarbeiter-notizen-types";
import {
  notizAnlegen,
  notizLoeschen,
} from "@/app/(admin)/admin/benutzer/actions";
import { useRelativeZeit } from "@/lib/hooks/useRelativeZeit";

export function NotizenThread({
  benutzerId,
  notizen,
  aktuellId,
}: {
  benutzerId: string;
  notizen: Notiz[];
  aktuellId: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (body.trim().length === 0) return;
    const fd = new FormData();
    fd.set("body", body);
    startTransition(async () => {
      await notizAnlegen(benutzerId, fd);
      setBody("");
      formRef.current?.reset();
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Compose */}
      <form
        ref={formRef}
        onSubmit={submit}
        className="space-y-2 rounded-lg border border-border bg-muted/30 p-3"
      >
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='z.B. "Hat gestern souverän die Beschwerde gelöst — Lob aussprechen."'
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            Sichtbar nur für Admin und Führungskraft. Mitarbeiter:in selbst
            sieht das nicht.
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={pending || body.trim().length === 0}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            {pending ? "Sende …" : "Notiz speichern"}
          </Button>
        </div>
      </form>

      {/* Liste */}
      {notizen.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground/40" />
          <p className="mt-2">Noch keine Notizen.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notizen.map((n) => (
            <NotizItem
              key={n.id}
              notiz={n}
              benutzerId={benutzerId}
              istEigene={n.autor_id === aktuellId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotizItem({
  notiz,
  benutzerId,
  istEigene,
}: {
  notiz: Notiz;
  benutzerId: string;
  istEigene: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const zeit = useRelativeZeit(notiz.created_at);

  const loeschen = () => {
    if (!confirm("Diese Notiz löschen?")) return;
    startTransition(async () => {
      await notizLoeschen(notiz.id, benutzerId);
      router.refresh();
    });
  };

  return (
    <li className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <ColoredAvatar
          name={notiz.autor_name}
          avatarPath={notiz.autor_avatar_path}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold">
              {notiz.autor_name ?? "Unbekannt"}
            </span>
            {zeit && (
              <span className="text-[11px] text-muted-foreground">
                · {zeit}
              </span>
            )}
          </div>
          <p className="mt-1 whitespace-pre-line text-sm">{notiz.body}</p>
        </div>
        {istEigene && (
          <button
            type="button"
            onClick={loeschen}
            disabled={pending}
            title="Notiz löschen"
            className="text-muted-foreground/60 transition-colors hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}
