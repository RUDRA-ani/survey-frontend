import { AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function TextInput({
  id,
  title,
  description,
  required,
  value,
  error,
  onChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label
          htmlFor={id}
          className="block text-base font-semibold leading-snug text-slate-800"
        >
          {title}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>

      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type your answer here..."
        rows={3}
        className={`resize-none rounded-xl bg-white ${
          error ? "border-red-300" : "border-slate-200"
        }`}
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}