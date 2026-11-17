import { AlertCircle, Star } from "lucide-react";

interface Props {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  value: number | undefined;
  error?: string;
  onChange: (value: number) => void;
}

export function RatingScale({
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
        <p
          id={`${id}-label`}
          className="text-base font-semibold leading-snug text-slate-800"
        >
          {title}
          {required && <span className="ml-1 text-red-500">*</span>}
        </p>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex gap-1.5"
          role="radiogroup"
          aria-labelledby={`${id}-label`}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = !!value && n <= value;

            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={value === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => onChange(n)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                  active
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/50"
                }`}
              >
                <Star
                  className={`h-6 w-6 ${
                    active
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {value ? (
          <span className="text-sm font-semibold text-slate-600">
            {value} / 5
          </span>
        ) : null}
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