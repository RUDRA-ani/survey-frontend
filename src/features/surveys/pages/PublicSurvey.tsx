
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { SurveyForm } from "../forms/SurveyForm";
import { type SurveySchema } from "../utils/types";
import { isQuestionVisible } from "../utils/validators";

import {
  getPublicSurvey,
  submitSurveyResponse,
  type Survey,
  type SurveyAnswer,
} from "@/services/survey.service";

export default function PublicSurvey() {
  const { id } = useParams();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSurvey() {
      if (!id) {
        setError("Survey ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const result = await getPublicSurvey(id);

        if (!cancelled) {
          setSurvey(result);
        }
      } catch (err) {
        console.error("Failed to load public survey:", err);

        if (!cancelled) {
          setError(
            "This survey is unavailable or has not been published."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSurvey();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const schema: SurveySchema | null = survey
    ? {
        title: survey.title,
        description: survey.description,
        questions: survey.questions.map((question) => ({
          id: question.id,
          type: question.type,
          title: question.title,
          required: question.required,
          options: question.options,
          visibleIf:
            question.condition?.operator === "equals"
              ? {
                  questionId: question.condition.questionId,
                  equals: question.condition.value,
                }
              : undefined,
        })),
      }
    : null;

  const handleSubmit = async (
    values: Record<string, string | string[] | number>
  ) => {
    if (!survey) {
      throw new Error("Survey is not available.");
    }

    const answers: SurveyAnswer[] = survey.questions
      .filter((question) => isQuestionVisible(
        {
          id: question.id,
          type: question.type,
          title: question.title,
          required: question.required,
          options: question.options,
          visibleIf:
            question.condition?.operator === "equals"
              ? {
                  questionId: question.condition.questionId,
                  equals: question.condition.value,
                }
              : undefined,
        },
        values
      ))
      .filter((question) => values[question.id] !== undefined)
      .map((question) => ({
        questionId: question.id,
        value: values[question.id],
      }));

    await submitSurveyResponse(survey.id, answers);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading survey...
        </p>
      </div>
    );
  }

  if (error || !survey || !schema) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-5">
        <FileText className="h-10 w-10 text-slate-400" />

        <h1 className="text-xl font-semibold text-slate-900">
          Survey unavailable
        </h1>

        <p className="max-w-md text-center text-sm text-muted-foreground">
          {error || "This survey could not be found."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4 sm:px-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Survey Platform
            </h1>
            <p className="text-xs text-muted-foreground">
              Public survey
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="mb-6 text-center">
          <Badge variant="secondary" className="mb-3">
            <FileText className="mr-1 h-3 w-3" />
            Survey
          </Badge>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {survey.title}
          </h2>

          {survey.description && (
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {survey.description}
            </p>
          )}
        </div>

        <SurveyForm
          schema={schema}
          onSubmit={handleSubmit}
        />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by Survey Platform
        </p>
      </main>
    </div>
  );
}
