import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { QuestionCard } from "../components/QuestionCard";
import { type SurveySchema, type FormValues } from "../utils/types";
import { validateAll, isQuestionVisible } from "../utils/validators";

interface Props {
  schema: SurveySchema;
  onSubmit: (data: FormValues) => void | Promise<void>;
}

// Remove answers of questions that are hidden (handles A -> B -> C chains)
const pruneHidden = (
  values: FormValues,
  questions: SurveySchema["questions"]
): FormValues => {
  const next: FormValues = { ...values };

  for (let pass = 0; pass < questions.length; pass++) {
    let changed = false;

    for (const question of questions) {
      if (next[question.id] !== undefined && !isQuestionVisible(question, next)) {
        delete next[question.id];
        changed = true;
      }
    }

    if (!changed) break;
  }

  return next;
};

const isAnswered = (value: unknown) =>
  value !== undefined &&
  value !== "" &&
  !(Array.isArray(value) && value.length === 0);

export function SurveyForm({ schema, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const visibleQuestions = useMemo(
    () => schema.questions.filter((q) => isQuestionVisible(q, values)),
    [schema.questions, values]
  );

  const answeredCount = visibleQuestions.filter((q) =>
    isAnswered(values[q.id])
  ).length;

  const progress =
    visibleQuestions.length === 0
      ? 0
      : Math.round((answeredCount / visibleQuestions.length) * 100);

  const handleFieldChange = (
    questionId: string,
    value: string | string[] | number
  ) => {
    const next = pruneHidden(
      { ...values, [questionId]: value },
      schema.questions
    );
    setValues(next);

    setErrors((prev) => {
      const cleaned = { ...prev };
      delete cleaned[questionId];
      for (const q of schema.questions) {
        if (!isQuestionVisible(q, next)) delete cleaned[q.id];
      }
      return cleaned;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    // Only validate and send questions that are currently visible
    const visibleValues: FormValues = {};
    for (const q of visibleQuestions) {
      if (values[q.id] !== undefined) visibleValues[q.id] = values[q.id];
    }

    const validationErrors = validateAll(visibleValues, visibleQuestions);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors highlighted below");

      const firstId = visibleQuestions.find((q) => validationErrors[q.id])?.id;
      if (firstId) {
        document
          .getElementById(`question-${firstId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      await onSubmit(visibleValues);

      setSubmitted(true);
      toast.success("Response submitted successfully!");
    } catch (error) {
      console.error("Response submission failed:", error);
      toast.error("Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            Thank you!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Your response has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-8 text-slate-900 sm:py-12">
      <div className="mx-auto w-full max-w-2xl space-y-5">
        {/* Survey header */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="h-2 bg-indigo-600" />
          <div className="space-y-3 p-6 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {schema.title}
            </h1>

            {schema.description && (
              <p className="text-sm leading-relaxed text-slate-500">
                {schema.description}
              </p>
            )}

            <p className="text-xs text-slate-400">
              <span className="text-red-500">*</span> Indicates a required
              question
            </p>

            <div className="pt-2">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Progress</span>
                <span className="font-semibold text-indigo-600">
                  {answeredCount} / {visibleQuestions.length} answered
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {visibleQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              index={index}
              question={question}
              values={values}
              errors={errors}
              onChange={handleFieldChange}
            />
          ))}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-400">
              Your answers are only sent when you submit.
            </p>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-6 shadow-md shadow-indigo-200 hover:bg-indigo-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Response
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}