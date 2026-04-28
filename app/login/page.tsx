import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginFormular } from "./LoginFormular";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ weiter?: string; fehler?: string }>;
}) {
  const { weiter, fehler } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold tracking-tight">
            VA
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Vitness Akademie</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Interne Schulungsplattform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Anmelden</CardTitle>
            <CardDescription>
              Melde dich mit deiner dienstlichen E-Mail an.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginFormular weiter={weiter} fehler={fehler} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Noch keinen Zugang? Wende dich bitte an dein Studio-Team.
        </p>
      </div>
    </main>
  );
}
