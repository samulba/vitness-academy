import Link from "next/link";
import { ArrowRight, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LetzterVersuch, QuizKurz } from "@/lib/quiz";

type Props = {
  quiz: QuizKurz;
  letzterVersuch: LetzterVersuch | null;
};

export function QuizCard({ quiz, letzterVersuch }: Props) {
  const hatBestanden = letzterVersuch?.passed === true;
  const hatVersuch = letzterVersuch !== null;

  return (
    <Card
      className={
        hatBestanden ? "border-success/40 bg-success/5" : "border-primary/30"
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Badge variant="outline" className="gap-1">
              <HelpCircle className="h-3 w-3" />
              Quiz
            </Badge>
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <CardDescription>
              Bestehen ab {quiz.passing_score}%
            </CardDescription>
          </div>
          {hatVersuch ? (
            hatBestanden ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Bestanden ({letzterVersuch?.score}%)
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Nicht bestanden ({letzterVersuch?.score}%)
              </Badge>
            )
          ) : (
            <Badge variant="outline">Noch nicht gestartet</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {hatBestanden
            ? "Du hast das Quiz bestanden. Du kannst es jederzeit wiederholen."
            : hatVersuch
              ? "Versuch's nochmal, du schaffst das!"
              : "Teste dein Wissen direkt im Anschluss."}
        </p>
        <Button asChild>
          <Link href={`/quiz/${quiz.id}`}>
            {hatVersuch ? "Erneut versuchen" : "Quiz starten"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
