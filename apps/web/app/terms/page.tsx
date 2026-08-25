import { LegalPage } from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        Rupert is an adversarial idea stress-testing tool. You are responsible for the ideas you submit and for any
        API keys you attach to your account in this browser.
      </p>
      <p>
        You must use your own model-provider credentials. Rupert does not provide shared API keys and does not store
        those keys on our servers.
      </p>
      <p>These terms are a working draft for the product, not formal legal advice.</p>
    </LegalPage>
  );
}
