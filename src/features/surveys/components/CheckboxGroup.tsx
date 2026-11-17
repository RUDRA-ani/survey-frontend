import { AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  options: string[];
  value: string[];
  error?: string;
  onChange: (value: string[]) => void;
}

export function CheckboxGroup({
  id,
  title,
  description,
  required,
  options,
  value,
  error,
  onChange,
}: Props) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-base font-semibold leading-snug text-slate-800">
          {title}
          {required && <span className="ml-1 text-red-500">*</span>}
        </p>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : (
          <p className="text-xs text-slate-400">Select all that apply</p>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option, optionIndex) => {
          const optionId = `${id}-${optionIndex}`;
          const checked = value.includes(option);

          return (
            <label
              key={optionId}
              htmlFor={optionId}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                checked
                  ? "border-indigo-400 bg-indigo-50/70 text-indigo-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50"
              }`}
            >
              <Checkbox
                id={optionId}
                checked={checked}
                onCheckedChange={() => toggle(option)}
              />
              <span className="flex-1 leading-snug">{option}</span>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}