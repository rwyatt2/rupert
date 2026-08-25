import { clerkKeyStatus } from "@/lib/clerk-env";
import { SsoCallbackClient } from "./sso-callback-client";

export const dynamic = "force-dynamic";

export default function SsoCallbackPage() {
  if (!clerkKeyStatus().hasPublishableKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-center text-sm text-zinc-400">
        Sign-in is not configured on this host.
      </main>
    );
  }

  return <SsoCallbackClient />;
}
