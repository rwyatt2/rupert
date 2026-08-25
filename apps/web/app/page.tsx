import { Dashboard } from "@/components/Dashboard";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  await auth.protect();
  return <Dashboard />;
}
