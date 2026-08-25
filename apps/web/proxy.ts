import { clerkKeyStatus } from "@/lib/clerk-env";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const inner = clerkMiddleware();

export default async function proxy(request: NextRequest, event?: unknown) {
  const keys = clerkKeyStatus();
  // #region agent log
  fetch("http://127.0.0.1:7316/ingest/f5df121e-99d4-46b1-8d42-b5498b9cb05c", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "42079f" },
    body: JSON.stringify({
      sessionId: "42079f",
      runId: "post-fix",
      location: "proxy.ts:entry",
      message: "clerk proxy entry",
      data: {
        ...keys,
        vercelEnv: process.env.VERCEL_ENV || null,
        nodeEnv: process.env.NODE_ENV || null,
        path: request.nextUrl.pathname,
        host: request.nextUrl.hostname,
      },
      timestamp: Date.now(),
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion

  if (!keys.configured) {
    // #region agent log
    fetch("http://127.0.0.1:7316/ingest/f5df121e-99d4-46b1-8d42-b5498b9cb05c", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "42079f" },
      body: JSON.stringify({
        sessionId: "42079f",
        runId: "post-fix",
        location: "proxy.ts:skip",
        message: "skipping clerkMiddleware; keys missing",
        data: { ...keys, path: request.nextUrl.pathname },
        timestamp: Date.now(),
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion
    const skipped = NextResponse.next();
    skipped.headers.set("x-rupert-clerk", "keys-missing");
    return skipped;
  }

  try {
    const response = await inner(request, event as never);
    // #region agent log
    fetch("http://127.0.0.1:7316/ingest/f5df121e-99d4-46b1-8d42-b5498b9cb05c", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "42079f" },
      body: JSON.stringify({
        sessionId: "42079f",
        runId: "post-fix",
        location: "proxy.ts:success",
        message: "clerk proxy returned",
        data: {
          status: response?.status ?? null,
          clerkAuthStatus: response?.headers.get("x-clerk-auth-status") ?? null,
          path: request.nextUrl.pathname,
        },
        timestamp: Date.now(),
        hypothesisId: "C",
      }),
    }).catch(() => {});
    // #endregion
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message.slice(0, 400) : String(error).slice(0, 400);
    // #region agent log
    fetch("http://127.0.0.1:7316/ingest/f5df121e-99d4-46b1-8d42-b5498b9cb05c", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "42079f" },
      body: JSON.stringify({
        sessionId: "42079f",
        runId: "post-fix",
        location: "proxy.ts:catch",
        message: "clerk proxy threw; passing through",
        data: {
          errorName: error instanceof Error ? error.name : "unknown",
          errorMessage,
          pkKind: keys.pkKind,
          path: request.nextUrl.pathname,
        },
        timestamp: Date.now(),
        hypothesisId: "C",
      }),
    }).catch(() => {});
    // #endregion
    const fallback = NextResponse.next();
    fallback.headers.set("x-rupert-clerk", "threw");
    fallback.headers.set("x-rupert-clerk-error", errorMessage.replace(/[\r\n]+/g, " ").slice(0, 200));
    return fallback;
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
