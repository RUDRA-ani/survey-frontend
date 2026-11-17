import { AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  options: string[];
  value: string | undefined;
  error?: string;
  onChange: (value: string) => void;
}

export function MultipleChoice({
  id,
  title,
  description,
  required,
  options,
  value,
  error,
  onChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-base font-semibold leading-snug text-slate-800">
          {title}
          {required && <span className="ml-1 text-red-500">*</span>}
        </p>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>

      <RadioGroup
        value={value ?? ""}
        onValueChange={onChange}
        className="gap-2"
      >
        {options.map((option, optionIndex) => {
          const optionId = `${id}-${optionIndex}`;
          const selected = value === option;

          return (
            <label
              key={optionId}
              htmlFor={optionId}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                selected
                  ? "border-indigo-400 bg-indigo-50/70 text-indigo-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50"
              }`}
            >
              <RadioGroupItem value={option} id={optionId} />
              <span className="flex-1 leading-snug">{option}</span>
            </label>
          );
        })}
      </RadioGroup>

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}