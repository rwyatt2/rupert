"use client";

import { HandleSSOCallback } from "@clerk/react";
import { useRouter } from "next/navigation";

export function SsoCallbackClient() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">
      <HandleSSOCallback
        navigateToApp={({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
            return;
          }
          router.push(url);
        }}
        navigateToSignIn={() => router.push("/sign-in")}
        navigateToSignUp={() => router.push("/sign-in")}
      />
      <p>Finishing sign in…</p>
    </main>
  );
}
