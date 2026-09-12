import { Dashboard } from "@/components/Dashboard";
import { LandingPage } from "@/components/LandingPage";
import { clerkKeyStatus } from "@/lib/clerk-env";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const keys = clerkKeyStatus();

  if (!keys.configured) return <LandingPage />;

  try {
    const { userId } = await auth();
    if (!userId) return <LandingPage />;
    return <Dashboard />;
  } catch {
    return <LandingPage />;
  }
}
