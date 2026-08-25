import { SignInForm } from "@/components/SignInForm";
import { clerkKeyStatus } from "@/lib/clerk-env";

export default function SignInPage() {
  const keys = clerkKeyStatus();
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100">
      {keys.hasPublishableKey ? (
        <SignInForm />
      ) : (
        <div className="max-w-md space-y-3 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Rupert</p>
          <h1 className="text-xl font-semibold">Sign-in is not configured</h1>
          <p className="text-sm leading-6 text-zinc-400">
            This host is missing Clerk keys. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in the Vercel
            project, then redeploy.
          </p>
        </div>
      )}
    </main>
  );
}
