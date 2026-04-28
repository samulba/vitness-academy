import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatProzent } from "@/lib/format";

type Props = {
  id: string;
  title: string;
  description: string | null;
  modulAnzahl: number;
  abgeschlossen: number;
  gesamt: number;
  prozent: number;
};

export function PfadCard({
  id,
  title,
  description,
  modulAnzahl,
  abgeschlossen,
  gesamt,
  prozent,
}: Props) {
  const fertig = gesamt > 0 && abgeschlossen === gesamt;

  return (
    <Link href={`/lernpfade/${id}`} className="group block">
      <Card className="hover-lift relative h-full overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 brand-gradient" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="brand-gradient-soft flex h-10 w-10 items-center justify-center rounded-xl">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            {fertig ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Abgeschlossen
              </Badge>
            ) : (
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            )}
          </div>
          <CardTitle className="text-lg leading-tight">{title}</CardTitle>
          {description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {modulAnzahl} {modulAnzahl === 1 ? "Modul" : "Module"}
            </span>
            <span className="font-medium text-foreground">
              {abgeschlossen}/{gesamt} Lektionen
            </span>
          </div>
          <div className="space-y-1">
            <Progress value={prozent} />
            <div className="flex justify-end text-xs text-muted-foreground">
              {formatProzent(prozent)} abgeschlossen
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
