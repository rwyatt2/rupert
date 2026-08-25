export function clerkKeyStatus() {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const sk = process.env.CLERK_SECRET_KEY || "";
  const pkKind = pk.startsWith("pk_live_")
    ? "live"
    : pk.startsWith("pk_test_")
      ? "test"
      : pk
        ? "other"
        : "missing";
  return {
    hasPublishableKey: Boolean(pk),
    hasSecretKey: Boolean(sk),
    pkKind,
    configured: Boolean(pk && sk),
  };
}
