"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
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
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
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
    <Card className="space-y-6 p-4 sm:p-6" data-testid="idea-form">
      <CardHeader className="p-0">
        <CardTitle>{copy.form.title}</CardTitle>
        <CardDescription>{copy.form.description}</CardDescription>
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
            <Label htmlFor="name">{copy.form.ideaName}</Label>
            <Input required id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">{copy.form.industry}</Label>
            <select required id="industry" name="industry" value={formData.industry} onChange={handleChange} className={fieldClass}>
              <option value="" disabled>
                {copy.form.industryPlaceholder}
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
            <Label htmlFor="ideaType">{copy.form.category}</Label>
            <select required id="ideaType" name="ideaType" value={formData.ideaType} onChange={handleChange} className={fieldClass}>
              <option value="" disabled>
                {copy.form.categoryPlaceholder}
              </option>
              {IDEA_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="industryDetail">{copy.form.industryDetail}</Label>
            <Input
              id="industryDetail"
              name="industryDetail"
              value={formData.industryDetail || ""}
              onChange={handleChange}
              placeholder={copy.form.industryDetailPlaceholder}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetCustomer">{copy.form.targetCustomer}</Label>
          <Input required id="targetCustomer" name="targetCustomer" value={formData.targetCustomer} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="problemStatement">{copy.form.problem}</Label>
          <textarea
            required
            id="problemStatement"
            rows={3}
            name="problemStatement"
            value={formData.problemStatement}
            onChange={handleChange}
            placeholder={copy.form.problemPlaceholder}
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposedSolution">{copy.form.solution}</Label>
          <textarea
            required
            id="proposedSolution"
            rows={3}
            name="proposedSolution"
            value={formData.proposedSolution}
            onChange={handleChange}
            placeholder={copy.form.solutionPlaceholder}
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="monetizationModel">{copy.form.monetization}</Label>
            <Input
              required
              id="monetizationModel"
              name="monetizationModel"
              value={formData.monetizationModel}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existingAlternatives">{copy.form.alternatives}</Label>
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
          <Label htmlFor="priorEvidence">{copy.form.priorEvidence}</Label>
          <textarea
            id="priorEvidence"
            rows={2}
            name="priorEvidence"
            value={formData.priorEvidence || ""}
            onChange={handleChange}
            placeholder={copy.form.priorEvidencePlaceholder}
            className={fieldClass}
          />
        </div>

        {isLoading ? (
          <RunStatusBar onCancel={onCancel} />
        ) : (
          <Button type="submit" size="lg">
            {copy.form.run}
          </Button>
        )}
      </form>
    </Card>
  );
}
