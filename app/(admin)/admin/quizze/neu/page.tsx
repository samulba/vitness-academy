import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Quizze", href: "/admin/quizze" },
          { label: "Neu" },
        ]}
        eyebrow="Quiz"
        title="Neues Quiz"
        description="Stammdaten anlegen. Fragen und Antworten ergänzt du danach auf der Detailseite."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">Stammdaten</h2>
        </div>
        <div className="p-5">
          <QuizFormular
            modus="anlegen"
            action={quizAnlegen}
            lektionen={lektionen}
            module={module}
          />
        </div>
      </div>
    </div>
  );
}
