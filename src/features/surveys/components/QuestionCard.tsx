import { type Question, type FormValues } from "../utils/types";
import { TextInput } from "./TextInput";
import { MultipleChoice } from "./MultipleChoice";
import { CheckboxGroup } from "./CheckboxGroup";
import { RatingScale } from "./RatingScale";

interface Props {
  question: Question;
  values: FormValues;
  errors: Record<string, string>;
  index?: number;
  onChange: (questionId: string, value: string | string[] | number) => void;
}

export function QuestionCard({
  question,
  values,
  errors,
  index,
  onChange,
}: Props) {
  const value = values[question.id];
  const error = errors[question.id];

  const renderInput = () => {
    switch (question.type) {
      case "text":
        return (
          <TextInput
            id={question.id}
            title={question.title}
            description={question.description}
            required={question.required}
            value={String(value ?? "")}
            error={error}
            onChange={(v) => onChange(question.id, v)}
          />
        );
      case "multiple_choice":
        return (
          <MultipleChoice
            id={question.id}
            title={question.title}
            description={question.description}
            required={question.required}
            options={question.options ?? []}
            value={value as string | undefined}
            error={error}
            onChange={(v) => onChange(question.id, v)}
          />
        );
      case "checkbox":
        return (
          <CheckboxGroup
            id={question.id}
            title={question.title}
            description={question.description}
            required={question.required}
            options={question.options ?? []}
            value={(value as string[]) ?? []}
            error={error}
            onChange={(v) => onChange(question.id, v)}
          />
        );
      case "rating":
        return (
          <RatingScale
            id={question.id}
            title={question.title}
            description={question.description}
            required={question.required}
            value={value as number | undefined}
            error={error}
            onChange={(v) => onChange(question.id, v)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`question-${question.id}`}
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors sm:p-6 ${
        error ? "border-red-300" : "border-slate-200/80"
      }`}
    >
      {typeof index === "number" && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Question {index + 1}
        </p>
      )}
      {renderInput()}
    </div>
  );
}