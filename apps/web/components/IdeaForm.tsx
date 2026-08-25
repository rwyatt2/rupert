"use client";

import { IDEA_TYPES, INDUSTRIES, type IdeaInput } from "@rupert/core";
import { RunStatusBar } from "@/components/RunStatusBar";
import { useEffect, useState } from "react";

type IdeaFormState = Omit<IdeaInput, "industry" | "ideaType"> & {
  industry: IdeaInput["industry"] | "";
  ideaType: IdeaInput["ideaType"] | "";
};

interface IdeaFormProps {
  onSubmit: (idea: IdeaInput) => void;
  onCancel?: () => void;
  isLoading: boolean;
  initialIdea?: IdeaInput | null;
  prefillNonce?: number;
}

const EMPTY_FORM: IdeaFormState = {
  name: "",
  industry: "",
  ideaType: "",
  targetCustomer: "",
  problemStatement: "",
  proposedSolution: "",
  monetizationModel: "",
  existingAlternatives: "",
  industryDetail: "",
  priorEvidence: "",
};

function toFormState(idea: IdeaInput | null | undefined): IdeaFormState {
  if (!idea) return EMPTY_FORM;
  return {
    ...idea,
    industryDetail: idea.industryDetail || "",
    priorEvidence: idea.priorEvidence || "",
  };
}

const fieldClass =
  "w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500";
const labelClass = "block text-xs font-mono uppercase text-zinc-400 mb-1";

export function IdeaForm({
  onSubmit,
  onCancel,
  isLoading,
  initialIdea,
  prefillNonce = 0,
}: IdeaFormProps) {
  const [formData, setFormData] = useState<IdeaFormState>(toFormState(initialIdea));

  useEffect(() => {
    setFormData(toFormState(initialIdea));
    // Prefill only when a new file is attached or removed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillNonce]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isLoading) return;
        if (!formData.industry || !formData.ideaType) return;
        onSubmit({ ...formData, industry: formData.industry, ideaType: formData.ideaType });
      }}
      className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Submit idea for red-teaming</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Vague inputs get vague kills. Quantify the pain or this will score like a toy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Idea / product name</label>
          <input required name="name" value={formData.name} onChange={handleChange} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Industry</label>
          <select required name="industry" value={formData.industry} onChange={handleChange} className={fieldClass}>
            <option value="" disabled>
              Select industry
            </option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category / type</label>
          <select required name="ideaType" value={formData.ideaType} onChange={handleChange} className={fieldClass}>
            <option value="" disabled>
              Select category
            </option>
            {IDEA_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Industry detail (optional)</label>
          <input
            name="industryDetail"
            value={formData.industryDetail || ""}
            onChange={handleChange}
            placeholder="e.g. InsurTech claims ops"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Target customer (ICP)</label>
        <input
          required
          name="targetCustomer"
          value={formData.targetCustomer}
          onChange={handleChange}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Specific problem statement</label>
        <textarea
          required
          rows={3}
          name="problemStatement"
          value={formData.problemStatement}
          onChange={handleChange}
          placeholder="Who is losing time or money right now? Quantify it."
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Proposed solution and claimed moat</label>
        <textarea
          required
          rows={3}
          name="proposedSolution"
          value={formData.proposedSolution}
          onChange={handleChange}
          placeholder="Why is this not a prompt or a feature of an incumbent?"
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Monetization and delivery</label>
          <input
            required
            name="monetizationModel"
            value={formData.monetizationModel}
            onChange={handleChange}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Existing alternatives</label>
          <input
            required
            name="existingAlternatives"
            value={formData.existingAlternatives}
            onChange={handleChange}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Prior evidence (optional, unverified)</label>
        <textarea
          rows={2}
          name="priorEvidence"
          value={formData.priorEvidence || ""}
          onChange={handleChange}
          placeholder="Notes from other MCPs, calls, or research. Treated as untrusted."
          className={fieldClass}
        />
      </div>

      {isLoading ? (
        <RunStatusBar onCancel={onCancel} />
      ) : (
        <button
          type="submit"
          className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider rounded transition"
        >
          Execute stress test
        </button>
      )}
    </form>
  );
}
