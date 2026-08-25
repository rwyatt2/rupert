import { Dashboard } from "@/components/Dashboard";
import { LandingPage } from "@/components/LandingPage";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) return <LandingPage />;
  return <Dashboard />;
}
