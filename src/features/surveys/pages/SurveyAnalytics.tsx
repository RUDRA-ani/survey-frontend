
import {useEffect,useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
   Star,
  MessageSquare,
  CheckSquare,
  Type,
  Users,
  ClipboardList,
  TrendingUp,
  CalendarDays,
  Download,
} from "lucide-react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getSurveyById,
  getSurveyAnalytics,
  type Survey,
  type SurveyAnalytics as AnalyticsData,
} from "@/services/survey.service";

 
 
 

 
 
// --- Question schema ---


const questionIcons = {
  text: Type,
  multiple_choice: CheckSquare,
  checkbox: CheckSquare,
  rating: Star,
};

const COLORS = [
  "bg-indigo-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
];

export default function SurveyAnalytics() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      if (!id) {
        setError("Survey ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [surveyData, analyticsData] = await Promise.all([
          getSurveyById(id),
          getSurveyAnalytics(id),
        ]);

        if (!cancelled) {
          setSurvey(surveyData);
          setAnalytics(analyticsData);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);

        if (!cancelled) {
          setError("Could not load survey analytics.");
          toast.error("Failed to load analytics");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <p className="text-sm text-slate-500">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error || !survey || !analytics) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f8fc]">
        <p className="text-sm text-red-500">
          {error || "Analytics not found."}
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const questions = survey.questions;

  const getQuestionAnalytics = (questionId: string) =>
    analytics.questions.find(
      (item) => item.questionId === questionId
    );

 
const totalResponses = analytics.totalResponses;
const totalRatings = analytics.totalRatings;
const overallAverageRating = analytics.overallAverageRating;
const textResponseCount = analytics.totalTextResponses;
  const formatQuestionType = (type: Survey["questions"][number]["type"]) => {
    const labels = {
      text: "Text response",
      multiple_choice: "Multiple choice",
      checkbox: "Checkbox",
      rating: "Rating",
    };

    return labels[type];
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <main className="mx-auto max-w-7xl space-y-8 px-5 py-7 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="h-10 w-10 rounded-xl border-slate-200 bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-400">
                  Workspace / Surveys / Analytics
                </p>
                {id && (
                  <Badge
                    variant="outline"
                    className="border-slate-200 text-slate-500"
                  >
                    ID: {id}
                  </Badge>
                )}
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Survey Analytics
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {survey.title}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white"
              onClick={() => window.print()}
            >
              <Download className="mr-2 h-4 w-4" />
              Export / Print
            </Button>
          </div>
        </div>

        {/* Overview heading */}
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            A summary of how respondents interacted with your survey.
          </p>
        </div>

        {/* Overview statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Responses
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  {totalResponses}
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  Submitted responses
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Questions
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  {questions.length}
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  In this survey
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <ClipboardList className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Average Rating
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                 {overallAverageRating.toFixed(1)}
                  <span className="ml-1 text-base font-medium text-slate-400">
                    / 5
                  </span>
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  From {totalRatings} ratings
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Star className="h-5 w-5 fill-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Text Feedback
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  {textResponseCount}
                </h3>
                <p className="mt-2 text-xs text-slate-400">
                  Written comments
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <MessageSquare className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response activity */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
              <CardTitle className="text-lg">
              Question Response Overview
            </CardTitle>
            <CardDescription className="mt-1">
              Number of respondents who answered each question.
            </CardDescription>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
<CardContent className="p-6">
  <div className="space-y-5">
{questions.map((question, index) => {
  const questionData = getQuestionAnalytics(question.id);
const count = questionData?.totalAnswers ?? 0;

  return (
    <div key={question.id} className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-slate-700">
          {index + 1}. {question.title}
        </span>
        <span className="shrink-0 text-sm text-slate-500">
          <strong className="text-slate-800">{count}</strong> answers
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${COLORS[index % COLORS.length]}`}
          style={{
            width: `${
              totalResponses > 0
                ? (count / totalResponses) * 100
                : 0
            }%`,
          }}
        />
      </div>
    </div>
  );
})}
  </div>
</CardContent>
        </Card>

        {/* Question breakdown */}
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Question Breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">
              Explore the answers submitted for each question.
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((question, index) => {
              const Icon = questionIcons[question.type];
              const questionData = getQuestionAnalytics(question.id);
const answerCount = questionData?.totalAnswers ?? 0;

              return (
                <Card
                  key={question.id}
                  className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm"
                >
                  <CardHeader className="border-b border-slate-100 px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Question {index + 1}
                          </p>
                          <CardTitle className="mt-1 text-base">
                            {question.title}
                          </CardTitle>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className="rounded-full border-slate-200 bg-slate-50 text-slate-500"
                      >
                        {formatQuestionType(question.type)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">

                    {/* Multiple choice and checkbox */}
                    {(question.type === "multiple_choice" ||
                      question.type === "checkbox") &&
                      question.options && (
                        <div className="space-y-5">
{Object.entries(questionData?.optionCounts ?? {}).map(
  ([option, count], optionIndex) => {
const percentage =
  questionData?.optionPercentages?.[option] ?? 0;;

    return (
      <div key={option} className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-700">
            {option}
          </span>
          <span className="text-sm text-slate-500">
            <strong className="text-slate-800">{count}</strong>{" "}
            ({percentage}%)
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${COLORS[optionIndex % COLORS.length]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
)}

                          {question.type === "checkbox" && (
                            <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
                              Respondents could select multiple options.
                              Percentages may add up to more than 100%.
                            </p>
                          )}
                        </div>
                      )}

                    {/* Rating */}
{question.type === "rating" && (
  <div className="flex flex-wrap items-center gap-5">
    <div>
      <p className="text-4xl font-bold tracking-tight">
        {(questionData?.averageRating ?? 0).toFixed(1)}
        <span className="ml-1 text-lg font-medium text-slate-400">
          / 5
        </span>
      </p>

      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`h-4 w-4 ${
              value <= Math.round(questionData?.averageRating ?? 0)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200"
            }`}
          />
        ))}
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Average respondent rating
      </p>
    </div>

    <div className="h-16 w-px bg-slate-100" />

    <div>
      <p className="text-2xl font-bold">{answerCount}</p>
      <p className="mt-1 text-xs text-slate-400">
        Total ratings
      </p>
    </div>
  </div>
)}

                    {/* Text responses */}
{question.type === "text" && (
  <div className="space-y-3">
    {(questionData?.textAnswers ?? []).map((answer, index) => (
      <div
        key={`${question.id}-${index}`}
        className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
      >
        <div className="mb-2">
          <Badge
            variant="outline"
            className="border-slate-200 bg-white text-slate-500"
          >
            Response {index + 1}
          </Badge>
        </div>

        <p className="text-sm leading-relaxed text-slate-700">
          {answer}
        </p>
      </div>
    ))}

    {(questionData?.textAnswers ?? []).length === 0 && (
      <div className="rounded-xl bg-slate-50 p-8 text-center">
        <MessageSquare className="mx-auto h-7 w-7 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">
          No text responses yet.
        </p>
      </div>
    )}
  </div>
)}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
<div className="flex items-center justify-center gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400">
  <CalendarDays className="h-3.5 w-3.5" />
  Analytics based on {totalResponses} submitted responses
</div>
      </main>
    </div>
  );
}
