import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuizFormular } from "@/components/admin/QuizFormular";
import { ladeLektionOptionen, ladeModulOptionen } from "@/lib/admin/optionen";
import { quizAnlegen } from "../actions";

export default async function NeuesQuizPage() {
  const [lektionen, module] = await Promise.all([
    ladeLektionOptionen(),
    ladeModulOptionen(),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/quizze"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Quizzen
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Neues Quiz</h1>
        <p className="mt-1 text-muted-foreground">
          Lege Stammdaten an. Fragen und Antworten ergänzt du danach auf der
          Detailseite.
        </p>
      </header>

      <QuizFormular
        modus="anlegen"
        action={quizAnlegen}
        lektionen={lektionen}
        module={module}
      />
    </div>
  );
}
