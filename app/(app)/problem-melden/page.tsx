import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth";
import { ProblemMeldenForm } from "./ProblemMeldenForm";

// Form mit File-Upload + Client-State -- Page bleibt schlank,
// die Logik liegt im Client-Wrapper.
export default async function ProblemMeldenPage() {
  await requireProfile();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Support"
        title="Problem melden"
        description="Ist dir ein Bug aufgefallen, hakt etwas in der App oder hast du einen Vorschlag? Gib uns Bescheid."
      />

      <ProblemMeldenForm />
    </div>
  );
}
