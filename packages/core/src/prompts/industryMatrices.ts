import type { Industry } from "../types";

export interface IndustryMatrix {
  industry: Industry;
  typicalBuyer: string;
  procurementFriction: string;
  regulation: string;
  incumbentBundlers: string;
  unitEconTraps: string;
  extraKillQuestions: string[];
}

export const INDUSTRY_MATRICES: Record<Industry, IndustryMatrix> = {
  "B2B SaaS": {
    industry: "B2B SaaS",
    typicalBuyer: "VP/Director with a budgeted software line, or founder-led SMB paying on a card.",
    procurementFriction:
      "Security questionnaire, SOC2 ask, legal redlines. Mid-market 1-3 months; enterprise 6-12.",
    regulation: "SOC2 Type II expected before serious mid-market. GDPR/CCPA if EU or consumer data.",
    incumbentBundlers:
      "Salesforce, Microsoft 365/Copilot, Google Workspace, ServiceNow, HubSpot — they add a checkbox feature and bundle it into the seat.",
    unitEconTraps:
      "Seat-based pricing vs usage-based LLM cost. Support-heavy onboarding that destroys gross margin. Discounting to win logos that never expand.",
    extraKillQuestions: [
      "Is this a feature the CRM/productivity suite ships next quarter?",
      "Who has budget authority without a 9-month RFP?",
      "What is the switching cost after 90 days of use?",
    ],
  },
  HealthTech: {
    industry: "HealthTech",
    typicalBuyer: "Hospital CIO/CMIO, health-system innovation, or payer medical economics — rarely the clinician who feels the pain.",
    procurementFriction:
      "12-18 month cycles, BAA, HITRUST/SOC2, clinical validation, IT security, and a champion who leaves mid-pilot.",
    regulation: "HIPAA/PHI, state privacy, FDA SaMD if clinical decision support, ONC interoperability rules.",
    incumbentBundlers: "Epic, Oracle Health, United/Optum, Teladoc, Microsoft Cloud for Healthcare.",
    unitEconTraps:
      "Human-in-the-loop review required for clinical safety. Integration to EHRs costs more than the product. Liability insurance and audit overhead.",
    extraKillQuestions: [
      "Does this touch PHI, and who is the covered entity / BAA counterparty?",
      "Is this CDS that pulls FDA SaMD classification?",
      "Can the buyer deploy without Epic App Orchard or equivalent?",
    ],
  },
  "Developer Tools": {
    industry: "Developer Tools",
    typicalBuyer: "Staff+ engineer or platform team lead. Purchases via card or existing cloud commit, not a dedicated procurement process — until enterprise SSO.",
    procurementFriction:
      "Bottom-up PLG until security/SSO/SCIM forces a legal review. Open-source alternatives are the real competitor.",
    regulation: "SOC2 for enterprise. SBOM/supply-chain if it runs in CI. Data residency if it sees source.",
    incumbentBundlers:
      "GitHub, GitLab, Atlassian, JetBrains, Cursor, VS Code, AWS/GCP/Azure, Datadog, HashiCorp.",
    unitEconTraps:
      "Free tier abuse. Inference cost on AI coding features. Support for every language/CI matrix. Commoditization by the editor or the git host.",
    extraKillQuestions: [
      "Is this a weekend plugin or a feature GitHub/Cursor/JetBrains will ship?",
      "Does it require seeing source code, and will security allow that?",
      "What is the path from individual card to company-wide standard?",
    ],
  },
  FinTech: {
    industry: "FinTech",
    typicalBuyer: "CFO, treasurer, head of risk, or fintech VP eng. Budget exists; trust and audit do not.",
    procurementFriction:
      "Vendor risk, SOC2, ISO 27001, penetration tests, data residency, and bank/partner due diligence.",
    regulation: "SOC2, PCI if cards, GLBA, SOX controls, state money-transmitter if moving funds, EU DORA/PSD2 where relevant.",
    incumbentBundlers: "Bloomberg, Stripe, Plaid, Adyen, FIS/Fiserv, JPMorgan, Excel + the incumbent ERP.",
    unitEconTraps:
      "Compliance headcount as COGS. False-positive review labor. Interchange/API fees that invert take-rate. Multi-year bank partnerships before revenue.",
    extraKillQuestions: [
      "Does this require a license or a bank sponsor?",
      "What is the cost of a false negative vs a false positive?",
      "Can an incumbent add this as a report in the existing terminal/ERP?",
    ],
  },
  "Consumer AI": {
    industry: "Consumer AI",
    typicalBuyer: "Individual consumer or prosumer. No economic buyer. Pays with attention first, card second.",
    procurementFriction:
      "None. Distribution is the entire problem. App-store tax, paid social CAC, and habit.",
    regulation: "COPPA if minors, GDPR/CCPA, app-store policies, upcoming AI labeling/safety rules, copyright on training/output.",
    incumbentBundlers: "OpenAI, Google, Apple, Meta, Microsoft Copilot, the default camera/keyboard/OS assistant.",
    unitEconTraps:
      "Inference cost per session vs $0-20/mo willingness to pay. Viral CAC that dies after week 2. Support and safety ops at consumer scale.",
    extraKillQuestions: [
      "Why does the foundation-model consumer app not absorb this next release?",
      "What is CAC vs 12-month LTV after app-store cut and inference?",
      "Is this a habit or a one-time novelty?",
    ],
  },
  Insurance: {
    industry: "Insurance",
    typicalBuyer: "Carrier CIO, claims VP, underwriting lead, or MGA principal. Consultants often gate the buy.",
    procurementFriction:
      "9-18 months, security, model-risk management, reinsurer comfort, and integration to Guidewire/Duck Creek/core systems.",
    regulation:
      "State DOI, NAIC model laws, unfair-discrimination rules for rating, GLBA, NYDFS, Solvency II / equivalent for EU.",
    incumbentBundlers: "Guidewire, Duck Creek, Sapiens, Verisk, ISO, the big brokers, and carrier IT.",
    unitEconTraps:
      "Services-heavy implementation. Model governance staff. Per-policy inference that looks cheap until loss-ratio blame hits. Multi-year core-system programs.",
    extraKillQuestions: [
      "Does this change a rating factor (regulated) or only a workflow (still political)?",
      "Who is liable when the model is wrong on a claim or a quote?",
      "Can this ship without a Guidewire/Duck Creek partnership?",
    ],
  },
};

export function getIndustryMatrix(industry: Industry): IndustryMatrix {
  return INDUSTRY_MATRICES[industry];
}

export function formatIndustryMatrix(industry: Industry): string {
  const m = getIndustryMatrix(industry);
  return [
    `INDUSTRY RISK MATRIX — ${m.industry}`,
    `Typical buyer: ${m.typicalBuyer}`,
    `Procurement friction: ${m.procurementFriction}`,
    `Regulation: ${m.regulation}`,
    `Incumbent bundlers: ${m.incumbentBundlers}`,
    `Unit-econ traps: ${m.unitEconTraps}`,
    `Extra kill questions:`,
    ...m.extraKillQuestions.map((q) => `- ${q}`),
  ].join("\n");
}
