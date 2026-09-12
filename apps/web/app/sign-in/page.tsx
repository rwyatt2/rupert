import { SignInForm } from "@/components/SignInForm";
import { clerkKeyStatus } from "@/lib/clerk-env";
import { copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const keys = clerkKeyStatus();
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 md:px-8" data-testid="sign-in-page">
      {keys.hasPublishableKey ? (
        <SignInForm />
      ) : (
        <div className="max-w-md space-y-4 px-4 text-center sm:px-0">
          <p className="caption-mono text-muted-foreground">{copy.brand.name}</p>
          <h1 className="h2">{copy.auth.notConfiguredTitle}</h1>
          <p className="description text-muted-foreground">{copy.auth.notConfiguredBody}</p>
        </div>
      )}
    </main>
  );
}
