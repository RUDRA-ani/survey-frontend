
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  FileText,
  Monitor,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { SurveyForm } from "../forms/SurveyForm";
import { type SurveySchema } from "../utils/types";

import {
  getSurveyById,
  type Survey,
} from "@/services/survey.service";

export default function SurveyPreview() {
  const navigate = useNavigate();
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
        const result = await getSurveyById(id);

        if (!cancelled) {
          setSurvey(result);
        }
      } catch (err) {
        console.error("Failed to load survey preview:", err);

        if (!cancelled) {
          setError("Could not load this survey.");
        }
      } finally {
        if (!cancelled) setLoading(false);
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
          visibleIf: question.condition
            ? {
                questionId: question.condition.questionId,
                equals: question.condition.value,
              }
            : undefined,
        })),
      }
    : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading survey preview...</p>
      </div>
    );
  }

  if (error || !survey || !schema) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-sm text-red-500">
          {error || "Survey not found."}
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>

              <div>
                <h1 className="text-sm font-semibold text-slate-900">
                  Survey Preview
                </h1>
                <p className="text-xs text-muted-foreground">
                  Respondent view
                </p>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className="gap-1.5 border-blue-200 bg-blue-50 px-3 py-1 text-blue-700"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview Mode
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            See how your survey looks
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            This is a preview of the experience your respondents will see
            when they open your survey.
          </p>
        </div>

        <div className="mx-auto mb-6 flex max-w-2xl items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-medium text-blue-900">
              You're viewing a preview
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-700">
              Test the questions and conditional logic. Submissions in this
              preview are not saved as actual survey responses.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <div className="h-1.5 bg-primary" />

            <CardContent className="p-5 sm:p-8">
              <div className="mb-6">
                <Badge variant="secondary" className="mb-3">
                  Survey Preview
                </Badge>

                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {schema.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {schema.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  {schema.questions.length} questions
                  <span>•</span>
                  <span>
                    {schema.questions.filter((q) => q.required).length}{" "}
                    required
                  </span>
                </div>
              </div>

              <div className="border-t pt-6">
                <SurveyForm
                  schema={schema}
                  onSubmit={(data) => {
                    console.log("Preview submission only:", data);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Powered by Survey Platform · Preview environment
          </p>
        </div>
      </main>
    </div>
  );
}
