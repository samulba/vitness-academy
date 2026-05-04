"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FEEDBACK_KATEGORIEN } from "@/lib/feedback-types";
import { feedbackErfassen } from "./actions";

const FELD = "h-10 rounded-lg";

const SENTIMENT_DOTS: Record<string, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-zinc-400",
  negative: "bg-rose-500",
};

const SENTIMENT_LABEL: Record<string, string> = {
  positive: "Positiv",
  neutral: "Neutral",
  negative: "Negativ",
};

export function FeedbackForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);

  const [sentiment, setSentiment] = useState<string>("neutral");
  const [category, setCategory] = useState<string>("allgemein");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("sentiment", sentiment);
    fd.set("category", category);
    startTransition(async () => {
      const res = await feedbackErfassen(fd);
      if (res.ok) {
        setErfolg(true);
        formRef.current?.reset();
        setSentiment("neutral");
        setCategory("allgemein");
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
      <div className="space-y-2">
        <Label htmlFor="feedback_text" className="text-sm font-medium">
          Was hat das Mitglied gesagt?
        </Label>
        <textarea
          id="feedback_text"
          name="feedback_text"
          required
          rows={3}
          maxLength={4000}
          placeholder='z.B. „Lob für die saubere Sauna, super Job"'
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.2)]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sentiment</Label>
          <Select value={sentiment} onValueChange={setSentiment}>
            <SelectTrigger className={FELD}>
              <SelectValue>
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${SENTIMENT_DOTS[sentiment]}`}
                  />
                  {SENTIMENT_LABEL[sentiment]}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="positive">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Positiv
                </span>
              </SelectItem>
              <SelectItem value="neutral">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-zinc-400" />
                  Neutral
                </span>
              </SelectItem>
              <SelectItem value="negative">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Negativ
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Kategorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={FELD}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FEEDBACK_KATEGORIEN.map((k) => (
                <SelectItem key={k.value} value={k.value}>
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="member_name" className="text-sm font-medium">
            Mitglied{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="member_name"
            name="member_name"
            maxLength={120}
            placeholder="Name oder Mitgliedsnummer"
            className={FELD}
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
          Feedback erfasst — danke!
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
      >
        <MessageSquarePlus className="h-4 w-4" />
        {pending ? "Sende …" : "Feedback erfassen"}
      </Button>
    </form>
  );
}
