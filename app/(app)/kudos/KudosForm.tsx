"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { kudosSenden } from "./actions";

const FELD = "h-10 rounded-lg";

export function KudosForm({
  empfaenger,
}: {
  empfaenger: { id: string; name: string }[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);
  const [toUser, setToUser] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("to_user", toUser);
    fd.set("message", message);
    startTransition(async () => {
      const res = await kudosSenden(fd);
      if (res.ok) {
        setErfolg(true);
        formRef.current?.reset();
        setToUser("");
        setMessage("");
        setTimeout(() => {
          router.refresh();
          setErfolg(false);
        }, 1200);
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Wem?</Label>
          <Select value={toUser} onValueChange={setToUser}>
            <SelectTrigger className={FELD}>
              <SelectValue placeholder="Kollegen wählen …" />
            </SelectTrigger>
            <SelectContent>
              {empfaenger.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Keine Kolleg:innen verfügbar.
                </div>
              ) : (
                empfaenger.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm font-medium">
            Wofür Lob?
          </Label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={3}
            maxLength={500}
            rows={2}
            placeholder='z.B. „Hat mir heute beim Empfang super geholfen, danke!"'
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.2)]"
          />
        </div>
      </div>

      {error && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
      {erfolg && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--success)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--success))]">
          <Check className="h-3.5 w-3.5" />
          Lob abgeschickt — danke!
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={pending || toUser === "" || message.trim().length < 3}
          className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Heart className="h-4 w-4" />
          {pending ? "Sende …" : "Lob senden"}
        </Button>
      </div>
    </form>
  );
}
