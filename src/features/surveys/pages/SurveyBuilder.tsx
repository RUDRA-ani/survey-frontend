import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  FileText,
  Type,
  CheckSquare,
  CircleDot,
  Star,
  Settings2,
  ClipboardList,
  Sparkles,
  ListChecks,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getSurveyById,
  createSurvey,
  updateSurvey,
  type SurveyPayload,
} from "@/services/survey.service";

// --- Types ---
type QuestionType = "text" | "multiple_choice" | "checkbox" | "rating";

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options: string[];
  visibleIf?: {
    questionId: string;
    equals: string;
  };
}

interface SurveyData {
  title: string;
  description: string;
  questions: Question[];
}

// --- Helpers ---
const generateId = () =>
  `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const questionTypes: {
  value: QuestionType;
  label: string;
  description: string;
  icon: typeof Type;
}[] = [
  {
    value: "text",
    label: "Text Input",
    description: "Open-ended written answer",
    icon: Type,
  },
  {
    value: "multiple_choice",
    label: "Multiple Choice",
    description: "Select one answer",
    icon: CircleDot,
  },
  {
    value: "checkbox",
    label: "Checkboxes",
    description: "Select multiple answers",
    icon: CheckSquare,
  },
  {
    value: "rating",
    label: "Rating",
    description: "Rate from 1 to 5 stars",
    icon: Star,
  },
];

const typeLabels: Record<QuestionType, string> = {
  text: "Text Input",
  multiple_choice: "Multiple Choice",
  checkbox: "Checkboxes",
  rating: "Rating (1–5)",
};

const nativeSelectClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export default function SurveyBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [data, setData] = useState<SurveyData>({
    title: "",
    description: "",
    questions: [],
  });

  const [newOption, setNewOption] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadSurvey = async () => {
      try {
        setLoading(true);

        const survey = await getSurveyById(id);

        setData({
          title: survey.title,
          description: survey.description,
          questions: survey.questions.map((question) => ({
            id: question.id,
            type: question.type,
            title: question.title,
            description: "",
            required: question.required,
            options: question.options ?? [],
            visibleIf:
              question.condition?.operator === "equals"
                ? {
                    questionId: question.condition.questionId,
                    equals: question.condition.value,
                  }
                : undefined,
          })),
        });
      } catch (error) {
        console.error("Failed to load survey:", error);
        toast.error("Failed to load survey");
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [id]);

  // --- Survey-level updates ---
  const setSurveyField = (field: "title" | "description", value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Question management ---
  const addQuestion = (type: QuestionType) => {
    const question: Question = {
      id: generateId(),
      type,
      title: "",
      description: "",
      required: false,
      options:
        type === "multiple_choice" || type === "checkbox"
          ? ["Option 1", "Option 2"]
          : [],
    };

    setData((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
  };

  const removeQuestion = (questionId: string) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((question) => question.id !== questionId)
        .map((question) =>
          question.visibleIf?.questionId === questionId
            ? { ...question, visibleIf: undefined }
            : question
        ),
    }));
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;

    if (target < 0 || target >= data.questions.length) return;

    const questions = [...data.questions];
    [questions[index], questions[target]] = [
      questions[target],
      questions[index],
    ];

    // A condition must point to an EARLIER question. After reordering,
    // clear any condition that now points to a later (or same) question.
    const positions = new Map(questions.map((q, i) => [q.id, i]));
    const cleaned = questions.map((question, i) => {
      if (!question.visibleIf) return question;
      const sourceIndex = positions.get(question.visibleIf.questionId);
      if (sourceIndex === undefined || sourceIndex >= i) {
        return { ...question, visibleIf: undefined };
      }
      return question;
    });

    setData((prev) => ({ ...prev, questions: cleaned }));
  };

  const updateQuestion = (
    questionId: string,
    field: keyof Question,
    value: any
  ) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId
          ? { ...question, [field]: value }
          : question
      ),
    }));
  };

  // --- Option management ---
  const addOption = (questionId: string) => {
    const value = newOption[questionId]?.trim();

    if (!value) return;

    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId
          ? { ...question, options: [...question.options, value] }
          : question
      ),
    }));

    setNewOption((prev) => ({ ...prev, [questionId]: "" }));
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    setData((prev) => {
      const source = prev.questions.find((q) => q.id === questionId);
      const oldValue = source?.options[optionIndex];

      return {
        ...prev,
        questions: prev.questions.map((question) => {
          if (question.id === questionId) {
            const options = [...question.options];
            options[optionIndex] = value;
            return { ...question, options };
          }

          // Keep dependent conditions in sync when an option is renamed
          if (
            question.visibleIf?.questionId === questionId &&
            oldValue !== undefined &&
            question.visibleIf.equals === oldValue
          ) {
            return {
              ...question,
              visibleIf: { ...question.visibleIf, equals: value },
            };
          }

          return question;
        }),
      };
    });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setData((prev) => {
      const source = prev.questions.find((q) => q.id === questionId);
      const removedValue = source?.options[optionIndex];

      return {
        ...prev,
        questions: prev.questions.map((question) => {
          if (question.id === questionId) {
            return {
              ...question,
              options: question.options.filter(
                (_, index) => index !== optionIndex
              ),
            };
          }

          // Clear the answer of any condition that used the removed option
          if (
            question.visibleIf?.questionId === questionId &&
            removedValue !== undefined &&
            question.visibleIf.equals === removedValue
          ) {
            return {
              ...question,
              visibleIf: { ...question.visibleIf, equals: "" },
            };
          }

          return question;
        }),
      };
    });
  };

  // --- Conditional logic ---
  const setConditionQuestion = (
    questionId: string,
    conditionQuestionId: string
  ) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.id !== questionId) return question;

        if (!conditionQuestionId) {
          return { ...question, visibleIf: undefined };
        }

        const sourceQuestion = prev.questions.find(
          (candidate) => candidate.id === conditionQuestionId
        );

        if (!sourceQuestion) {
          return { ...question, visibleIf: undefined };
        }

        return {
          ...question,
          visibleIf: {
            questionId: sourceQuestion.id,
            equals: sourceQuestion.options[0] ?? "",
          },
        };
      }),
    }));
  };

  const setConditionAnswer = (questionId: string, answer: string) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId && question.visibleIf
          ? {
              ...question,
              visibleIf: { ...question.visibleIf, equals: answer },
            }
          : question
      ),
    }));
  };

  // --- Save ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!data.title.trim()) {
      toast.error("Survey title is required");
      return;
    }

    const invalidQuestion = data.questions.find(
      (question) =>
        !question.title.trim() ||
        ((question.type === "multiple_choice" ||
          question.type === "checkbox") &&
          question.options.filter((option) => option.trim()).length < 2)
    );

    if (invalidQuestion) {
      toast.error(
        "Please complete all questions and provide at least two options"
      );
      return;
    }

    const invalidCondition = data.questions.find(
      (question) => question.visibleIf && !question.visibleIf.equals
    );

    if (invalidCondition) {
      toast.error("Please choose an answer for each conditional question");
      return;
    }

    const payload: SurveyPayload = {
      title: data.title.trim(),
      description: data.description.trim(),
      questions: data.questions.map((question) => ({
        id: question.id,
        title: question.title.trim(),
        type: question.type,
        required: question.required,
        options: question.options.map((option) => option.trim()),
        condition: question.visibleIf
          ? {
              questionId: question.visibleIf.questionId,
              operator: "equals",
              value: question.visibleIf.equals,
            }
          : undefined,
      })),
    };

    try {
      setSaving(true);

      if (id) {
        await updateSurvey(id, payload);
        toast.success("Survey updated successfully!");
      } else {
        await createSurvey(payload);
        toast.success("Survey created successfully!");
      }

      navigate("/");
    } catch (error) {
      console.error("Failed to save survey:", error);
      toast.error("Failed to save survey. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const questionCount = data.questions.length;
  const requiredCount = data.questions.filter(
    (question) => question.required
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-slate-200 bg-white"
              onClick={() => navigate("/")}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <p className="text-sm font-medium text-slate-400">
                Workspace / Surveys / {isEdit ? "Edit" : "Create"}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {isEdit ? "Edit Survey" : "Create a Survey"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Design your questions and customize the respondent experience.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white"
              type="button"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="builder-form"
              className="rounded-xl bg-indigo-600 px-5 shadow-md shadow-indigo-200 hover:bg-indigo-700"
              disabled={saving || loading}
            >
              Save Survey
            </Button>
          </div>
        </div>

        <form
          id="builder-form"
          onSubmit={handleSubmit}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
        >
          {/* Main editor */}
          <div className="min-w-0 space-y-6">
            {/* Survey details */}
            <Card className="rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Survey Details</CardTitle>
                    <CardDescription className="mt-1">
                      Give your survey a name and a short introduction.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <Label htmlFor="survey-title">
                    Survey Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="survey-title"
                    value={data.title}
                    onChange={(event) =>
                      setSurveyField("title", event.target.value)
                    }
                    placeholder="e.g. Customer Satisfaction Survey"
                    className="h-11 rounded-xl border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="survey-description">Description</Label>
                  <Textarea
                    id="survey-description"
                    value={data.description}
                    onChange={(event) =>
                      setSurveyField("description", event.target.value)
                    }
                    placeholder="Tell respondents what this survey is about..."
                    rows={3}
                    className="resize-none rounded-xl border-slate-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card className="rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
                <div>
                  <CardTitle className="text-lg">Questions</CardTitle>
                  <CardDescription className="mt-1">
                    Create and configure your survey questions.
                  </CardDescription>
                </div>

                <BadgeCount count={questionCount} />
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                {questionCount === 0 && (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                      <ClipboardList className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-800">
                      Start building your survey
                    </h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
                      Add your first question using the question types below.
                    </p>
                  </div>
                )}

                {data.questions.map((question, index) => {
                  const QuestionIcon =
                    questionTypes.find((type) => type.value === question.type)
                      ?.icon ?? Type;

                  const previousQuestions = data.questions
                    .slice(0, index)
                    .filter((candidate) => candidate.type === "multiple_choice");

                  const conditionQuestion = previousQuestions.find(
                    (candidate) =>
                      candidate.id === question.visibleIf?.questionId
                  );

                  return (
                    <div
                      key={question.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-sm"
                    >
                      {/* Question header */}
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-slate-300" />

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <QuestionIcon className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              Question {index + 1}
                            </p>
                            <p className="text-xs text-slate-400">
                              {typeLabels[question.type]}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600"
                            onClick={() => moveQuestion(index, -1)}
                            disabled={index === 0}
                            title="Move up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600"
                            onClick={() => moveQuestion(index, 1)}
                            disabled={index === questionCount - 1}
                            title="Move down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => removeQuestion(question.id)}
                            title="Delete question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Question content */}
                      <div className="space-y-5 p-5">
                        <div className="space-y-2">
                          <Label>
                            Question Text <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={question.title}
                            onChange={(event) =>
                              updateQuestion(
                                question.id,
                                "title",
                                event.target.value
                              )
                            }
                            placeholder="e.g. How satisfied are you with our service?"
                            className="h-11 rounded-xl border-slate-200"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description (optional)</Label>
                          <Input
                            value={question.description ?? ""}
                            onChange={(event) =>
                              updateQuestion(
                                question.id,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Add a short hint for respondents..."
                            className="rounded-xl border-slate-200"
                          />
                        </div>

                        {/* Answer options */}
                        {(question.type === "multiple_choice" ||
                          question.type === "checkbox") && (
                          <div className="space-y-3 rounded-xl bg-slate-50/80 p-4">
                            <div className="flex items-center justify-between">
                              <Label>Answer Options</Label>
                              <span className="text-xs text-slate-400">
                                {question.options.length} options
                              </span>
                            </div>

                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={`${question.id}-${optionIndex}`}
                                  className="flex items-center gap-2"
                                >
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-400">
                                    {optionIndex + 1}
                                  </div>

                                  <Input
                                    value={option}
                                    onChange={(event) =>
                                      updateOption(
                                        question.id,
                                        optionIndex,
                                        event.target.value
                                      )
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="h-10 rounded-lg border-slate-200 bg-white"
                                    required
                                  />

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                    onClick={() =>
                                      removeOption(question.id, optionIndex)
                                    }
                                    disabled={question.options.length <= 2}
                                    title="Remove option"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <Input
                                value={newOption[question.id] ?? ""}
                                onChange={(event) =>
                                  setNewOption((prev) => ({
                                    ...prev,
                                    [question.id]: event.target.value,
                                  }))
                                }
                                placeholder="Enter a new option..."
                                className="h-10 rounded-lg border-slate-200 bg-white"
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    addOption(question.id);
                                  }
                                }}
                              />

                              <Button
                                type="button"
                                variant="outline"
                                className="h-10 shrink-0 rounded-lg border-slate-200 bg-white"
                                onClick={() => addOption(question.id)}
                              >
                                <Plus className="mr-1 h-4 w-4" />
                                Add
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Rating preview */}
                        {question.type === "rating" && (
                          <div className="rounded-xl bg-slate-50 p-4">
                            <Label className="text-xs text-slate-500">
                              Respondent rating preview
                            </Label>
                            <div className="mt-3 flex gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <div
                                  key={rating}
                                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-300"
                                >
                                  <Star className="h-5 w-5" />
                                </div>
                              ))}
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                              Respondents will select a rating from 1 to 5.
                            </p>
                          </div>
                        )}

                        {/* Conditional logic */}
                        <div className="space-y-3 rounded-xl border border-slate-100 p-4">
                          <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-indigo-500" />
                            <Label className="font-semibold">
                              Conditional Logic
                            </Label>
                            <Badge variant="outline" className="text-[10px]">
                              Optional
                            </Badge>
                          </div>

                          <p className="text-xs leading-relaxed text-slate-400">
                            Show this question only when an earlier
                            multiple-choice question has a specific answer.
                          </p>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-slate-500">
                                When question
                              </Label>
                              <select
                                className={nativeSelectClass}
                                value={conditionQuestion?.id ?? ""}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  if (!value) {
                                    updateQuestion(
                                      question.id,
                                      "visibleIf",
                                      undefined
                                    );
                                  } else {
                                    setConditionQuestion(question.id, value);
                                  }
                                }}
                              >
                                <option value="">Always show</option>
                                {previousQuestions.map((candidate) => (
                                  <option key={candidate.id} value={candidate.id}>
                                    Q{data.questions.indexOf(candidate) + 1}:{" "}
                                    {candidate.title || "Untitled question"}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs text-slate-500">
                                Has answer
                              </Label>
                              <select
                                className={nativeSelectClass}
                                value={
                                  conditionQuestion
                                    ? question.visibleIf?.equals ?? ""
                                    : ""
                                }
                                disabled={!conditionQuestion}
                                onChange={(event) =>
                                  setConditionAnswer(
                                    question.id,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="">Choose answer</option>
                                {conditionQuestion?.options
                                  .filter((option) => option.trim())
                                  .map((option, optionIndex) => (
                                    <option
                                      key={`${option}-${optionIndex}`}
                                      value={option}
                                    >
                                      {option}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Required */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              Required question
                            </p>
                            <p className="text-xs text-slate-400">
                              Respondents must answer this question.
                            </p>
                          </div>

                          <Checkbox
                            id={`required-${question.id}`}
                            checked={question.required}
                            onCheckedChange={(checked) =>
                              updateQuestion(
                                question.id,
                                "required",
                                Boolean(checked)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add question button */}
                <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    Add another question
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {questionTypes.map((type) => {
                      const Icon = type.icon;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => addQuestion(type.value)}
                          className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:border-indigo-300 hover:bg-indigo-50"
                        >
                          <Icon className="h-5 w-5 text-indigo-600" />
                          <span className="text-xs font-semibold text-slate-700">
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom save actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-200 bg-white"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-xl bg-indigo-600 px-6 hover:bg-indigo-700"
                disabled={saving || loading}
              >
                Save Survey
              </Button>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6">
            <Card className="rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListChecks className="h-4 w-4 text-indigo-600" />
                  Survey Summary
                </CardTitle>
                <CardDescription>Your survey at a glance.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm text-slate-500">Total questions</span>
                  <span className="text-lg font-bold">{questionCount}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm text-slate-500">
                    Required questions
                  </span>
                  <span className="text-lg font-bold">{requiredCount}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm text-slate-500">
                    Optional questions
                  </span>
                  <span className="text-lg font-bold">
                    {questionCount - requiredCount}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Question types
                  </p>

                  <div className="mt-3 space-y-3">
                    {questionTypes.map((type) => {
                      const Icon = type.icon;
                      const count = data.questions.filter(
                        (question) => question.type === type.value
                      ).length;

                      return (
                        <div
                          key={type.value}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-slate-400" />
                            <span className="text-xs text-slate-600">
                              {type.label}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-indigo-100 bg-indigo-50/60 shadow-none">
              <CardContent className="p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-800">
                  Make your survey effective
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Keep questions clear and concise. Use conditional logic to
                  show respondents only the questions relevant to them.
                </p>
              </CardContent>
            </Card>
          </aside>
        </form>
      </main>
    </div>
  );
}

// Small summary badge
function BadgeCount({ count }: { count: number }) {
  return (
    <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
      {count} {count === 1 ? "question" : "questions"}
    </div>
  );
}