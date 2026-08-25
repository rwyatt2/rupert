import { LegalPage } from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        Sign-in is handled by Clerk. We receive your account identity (such as name and email) so we can keep you signed
        in.
      </p>
      <p>
        Provider API keys, model settings, and evaluation history stay in this browser, namespaced to your signed-in
        user. They are sent to Rupert&apos;s evaluation endpoint only for the request you start, then onward to the
        provider you chose. They are not written to a remote store.
      </p>
      <p>This policy is a working draft for the product, not formal legal advice.</p>
    </LegalPage>
  );
}
