import { CheckCircle2, Info, AlertTriangle, Video } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type {
  AkkordeonContent,
  AufdeckKarteContent,
  ContentBlock,
  InlineQuizContent,
  SchritteContent,
  SortierenContent,
  SzenarioContent,
} from "@/lib/lektion";
import { AufdeckKarte } from "@/components/lektion/blocks/AufdeckKarte";
import { InlineQuiz } from "@/components/lektion/blocks/InlineQuiz";
import { Akkordeon } from "@/components/lektion/blocks/Akkordeon";
import { SortierAufgabe } from "@/components/lektion/blocks/SortierAufgabe";
import { Szenario } from "@/components/lektion/blocks/Szenario";
import { Schritte } from "@/components/lektion/blocks/Schritte";

export function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.block_type) {
    case "text":
      return <TextBlock markdown={String(block.content?.markdown ?? "")} />;
    case "checkliste":
      return (
        <ChecklistBlock
          items={(block.content?.items as string[] | undefined) ?? []}
        />
      );
    case "hinweis":
      return (
        <HinweisBlock
          variant={(block.content?.variant as string) === "warnung" ? "warnung" : "info"}
          markdown={String(block.content?.markdown ?? "")}
        />
      );
    case "video_url":
      return (
        <VideoBlock
          url={String(block.content?.url ?? "")}
          title={String(block.content?.title ?? "Video")}
        />
      );
    case "aufdeck_karte":
      return (
        <AufdeckKarte
          content={block.content as unknown as AufdeckKarteContent}
        />
      );
    case "inline_quiz":
      return (
        <InlineQuiz content={block.content as unknown as InlineQuizContent} />
      );
    case "akkordeon":
      return (
        <Akkordeon content={block.content as unknown as AkkordeonContent} />
      );
    case "sortieren":
      return (
        <SortierAufgabe
          content={block.content as unknown as SortierenContent}
        />
      );
    case "szenario":
      return (
        <Szenario content={block.content as unknown as SzenarioContent} />
      );
    case "schritte":
      return (
        <Schritte content={block.content as unknown as SchritteContent} />
      );
    default:
      return null;
  }
}

function TextBlock({ markdown }: { markdown: string }) {
  return (
    <div className="prose-vitness">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}

function ChecklistBlock({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span className="text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function HinweisBlock({
  variant,
  markdown,
}: {
  variant: "info" | "warnung";
  markdown: string;
}) {
  const Icon = variant === "warnung" ? AlertTriangle : Info;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4",
        variant === "warnung"
          ? "border-warning/40 bg-warning/10 text-foreground"
          : "border-primary/30 bg-primary/5 text-foreground",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          variant === "warnung" ? "text-warning" : "text-primary",
        )}
      />
      <div className="prose-vitness text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

function VideoBlock({ url, title }: { url: string; title: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4 transition-colors hover:bg-muted"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Video className="h-5 w-5" />
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">Video öffnen</div>
      </div>
    </a>
  );
}
