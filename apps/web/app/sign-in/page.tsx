import { SignInForm } from "@/components/SignInForm";
import { clerkKeyStatus } from "@/lib/clerk-env";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const keys = clerkKeyStatus();
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 md:px-8">
      {keys.hasPublishableKey ? (
        <SignInForm />
      ) : (
        <div className="max-w-md space-y-4 text-center">
          <p className="caption-mono text-muted-foreground">Rupert</p>
          <h1 className="h2">Sign-in is not configured</h1>
          <p className="description text-muted-foreground">
            This host is missing Clerk keys. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in the Vercel
            project, then redeploy.
          </p>
        </div>
      )}
    </main>
  );
}
