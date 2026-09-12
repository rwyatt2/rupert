"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IDEA_TYPES, INDUSTRIES, type IdeaInput } from "@rupert/core";
import { RunStatusBar } from "@/components/RunStatusBar";
import { cn } from "@/lib/utils";
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

const fieldClass = cn(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillNonce]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>Submit idea for red-teaming</CardTitle>
        <CardDescription>
          Vague inputs get vague kills. Quantify the pain or this will score like a toy.
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLoading) return;
          if (!formData.industry || !formData.ideaType) return;
          onSubmit({ ...formData, industry: formData.industry, ideaType: formData.ideaType });
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Idea / product name</Label>
            <Input required id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <select required id="industry" name="industry" value={formData.industry} onChange={handleChange} className={fieldClass}>
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ideaType">Category / type</Label>
            <select required id="ideaType" name="ideaType" value={formData.ideaType} onChange={handleChange} className={fieldClass}>
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
          <div className="space-y-2">
            <Label htmlFor="industryDetail">Industry detail (optional)</Label>
            <Input
              id="industryDetail"
              name="industryDetail"
              value={formData.industryDetail || ""}
              onChange={handleChange}
              placeholder="e.g. InsurTech claims ops"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetCustomer">Target customer (ICP)</Label>
          <Input required id="targetCustomer" name="targetCustomer" value={formData.targetCustomer} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="problemStatement">Specific problem statement</Label>
          <textarea
            required
            id="problemStatement"
            rows={3}
            name="problemStatement"
            value={formData.problemStatement}
            onChange={handleChange}
            placeholder="Who is losing time or money right now? Quantify it."
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposedSolution">Proposed solution and claimed moat</Label>
          <textarea
            required
            id="proposedSolution"
            rows={3}
            name="proposedSolution"
            value={formData.proposedSolution}
            onChange={handleChange}
            placeholder="Why is this not a prompt or a feature of an incumbent?"
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="monetizationModel">Monetization and delivery</Label>
            <Input
              required
              id="monetizationModel"
              name="monetizationModel"
              value={formData.monetizationModel}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existingAlternatives">Existing alternatives</Label>
            <Input
              required
              id="existingAlternatives"
              name="existingAlternatives"
              value={formData.existingAlternatives}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priorEvidence">Prior evidence (optional, unverified)</Label>
          <textarea
            id="priorEvidence"
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
          <Button type="submit" size="lg">
            Execute stress test
          </Button>
        )}
      </form>
    </Card>
  );
}
