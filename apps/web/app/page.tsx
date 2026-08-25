import { Dashboard } from "@/components/Dashboard";
import { LandingPage } from "@/components/LandingPage";
import { clerkKeyStatus } from "@/lib/clerk-env";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const keys = clerkKeyStatus();
  // #region agent log
  fetch("http://127.0.0.1:7316/ingest/f5df121e-99d4-46b1-8d42-b5498b9cb05c", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "42079f" },
    body: JSON.stringify({
      sessionId: "42079f",
      runId: "post-fix",
      location: "page.tsx:auth",
      message: "homepage auth gate",
      data: { ...keys, vercelEnv: process.env.VERCEL_ENV || null },
      timestamp: Date.now(),
      hypothesisId: "B",
    }),
  }).catch(() => {});
  // #endregion

  if (!keys.configured) return <LandingPage />;

  try {
    const { userId } = await auth();
    // #region agent log
    fetch("http://127.0.0.1:7316/ingest/f5df121e-99d4-46b1-8d42-b5498b9cb05c", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "42079f" },
      body: JSON.stringify({
        sessionId: "42079f",
        runId: "post-fix",
        location: "page.tsx:auth-ok",
        message: "homepage auth() resolved",
        data: { signedIn: Boolean(userId) },
        timestamp: Date.now(),
        hypothesisId: "B",
      }),
    }).catch(() => {});
    // #endregion
    if (!userId) return <LandingPage />;
    return <Dashboard />;
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7316/ingest/f5df121e-99d4-46b1-8d42-b5498b9cb05c", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "42079f" },
      body: JSON.stringify({
        sessionId: "42079f",
        runId: "post-fix",
        location: "page.tsx:auth-catch",
        message: "auth() threw",
        data: {
          errorName: error instanceof Error ? error.name : "unknown",
          errorMessage: error instanceof Error ? error.message.slice(0, 400) : String(error).slice(0, 400),
        },
        timestamp: Date.now(),
        hypothesisId: "B",
      }),
    }).catch(() => {});
    // #endregion
    return <LandingPage />;
  }
}
