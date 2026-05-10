import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth";
import { RollenForm } from "../Form";
import { TypWahl } from "../TypWahl";

export default async function NeueRollePage({
  searchParams,
}: {
  searchParams: Promise<{ typ?: string }>;
}) {
  await requirePermission("rollen", "create");
  const { typ } = await searchParams;
  const typValidated =
    typ === "mitarbeiter" || typ === "verwaltung" ? typ : null;

  const title =
    typValidated === "mitarbeiter"
      ? "Neue Mitarbeiter-Rolle"
      : typValidated === "verwaltung"
        ? "Neue Verwaltungs-Rolle"
        : "Neue Rolle";

  const description =
    typValidated === "mitarbeiter"
      ? "Diese Rolle filtert Tabs in der Mitarbeiter-App. Wähle aus, welche Tabs ihre Mitarbeiter sehen."
      : typValidated === "verwaltung"
        ? "Diese Rolle bestimmt feingranularen Zugriff auf /admin/. Wähle Module und Aktionen, die freigeschaltet sind."
        : "Wähle, was für eine Art Rolle du anlegen willst.";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Rollen & Rechte", href: "/admin/rollen" },
          { label: typValidated ? title : "Neu" },
        ]}
        eyebrow="Stammdaten"
        title={title}
        description={description}
      />

      {typValidated === null ? (
        <TypWahl />
      ) : (
        <RollenForm mode="neu" typ={typValidated} />
      )}
    </div>
  );
}
