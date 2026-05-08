import { Frown, MessageCircle, Smile, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { feedbackStats, ladeFeedback } from "@/lib/feedback";
import { FeedbackTable } from "./FeedbackTable";

export default async function FeedbackAdminPage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  // Admin sieht Feedback ueber alle Standorte.
  const [feedback, stats] = await Promise.all([
    ladeFeedback({ locationId: null, limit: 200 }),
    feedbackStats({ locationId: null }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio-Daten"
        title="Mitglieder-Feedback"
        description="Stimmungsbild aus den letzten Wochen — was Mitglieder den Mitarbeiter:innen mitgeteilt haben."
      />

      <StatGrid cols={4}>
        <StatCard label="Gesamt" value={stats.total} icon={<MessageCircle />} />
        <StatCard
          label="Positiv"
          value={stats.positive}
          icon={<Smile />}
        />
        <StatCard
          label="Negativ"
          value={stats.negative}
          icon={<Frown />}
        />
        <StatCard
          label="Letzte 7 Tage"
          value={stats.letzte7Tage}
          icon={<TrendingUp />}
        />
      </StatGrid>

      {feedback.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            title="Noch kein Feedback erfasst"
            description="Sobald Mitarbeiter:innen Feedback auf /feedback eingeben, taucht es hier auf."
          />
        </div>
      ) : (
        <FeedbackTable feedback={feedback} />
      )}
    </div>
  );
}
