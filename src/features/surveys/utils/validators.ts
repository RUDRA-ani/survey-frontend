import   { type FormValues,type Question } from "./types";

// --- Regex patterns ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;
const URL_REGEX = /^https?:\/\/[^\s]+$/;
const NUMBER_REGEX = /^\d+$/;

// --- Field-level validators (return error string or null) ---

export function validateText(value: string, question: Question): string | null {
  if (question.required && !value.trim()) {
    return "This field is required";
  }

  const q = question.title.toLowerCase();

  if (q.includes("email") && value && !EMAIL_REGEX.test(value)) {
    return "Please enter a valid email address";
  }
  if (q.includes("phone") && value && !PHONE_REGEX.test(value)) {
    return "Please enter a valid phone number";
  }
  if (q.includes("url") || q.includes("website") && value && !URL_REGEX.test(value)) {
    return "Please enter a valid URL (must start with http:// or https://)";
  }
  if (q.includes("age") && value && !NUMBER_REGEX.test(value)) {
    return "Please enter a number";
  }

  return null;
}

export function validateMultipleChoice(
  value: string | undefined,
  question: Question
): string | null {
  if (question.required && !value) {
    return "Please select an option";
  }
  return null;
}

export function validateCheckbox(
  value: string[] | undefined,
  question: Question
): string | null {
  if (question.required && (!value || value.length === 0)) {
    return "Please select at least one option";
  }
  return null;
}

export function validateRating(
  value: number | undefined,
  question: Question
): string | null {
  if (question.required && (!value || value < 1 || value > 5)) {
    return "Please select a rating from 1 to 5";
  }
  return null;
}

// --- Master validator: checks all questions, returns error map ---
export function validateAll(
  values: FormValues,
  questions: Question[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const q of questions) {
    // Skip hidden questions (conditional logic)
    if (q.visibleIf && !isQuestionVisible(q, values)) continue;

    const val = values[q.id];

    switch (q.type) {
      case "text": {
        const err = validateText(String(val ?? ""), q);
        if (err) errors[q.id] = err;
        break;
      }
      case "multiple_choice": {
        const err = validateMultipleChoice(val as string | undefined, q);
        if (err) errors[q.id] = err;
        break;
      }
      case "checkbox": {
        const err = validateCheckbox(val as string[] | undefined, q);
        if (err) errors[q.id] = err;
        break;
      }
      case "rating": {
        const err = validateRating(val as number | undefined, q);
        if (err) errors[q.id] = err;
        break;
      }
    }
  }

  return errors;
}

// --- Conditional visibility helper ---
export function isQuestionVisible(
  question: Question,
  values: FormValues
): boolean {
  if (!question.visibleIf) return true;

  const { questionId, equals } = question.visibleIf;
  const answer = values[questionId];

  if (Array.isArray(equals)) {
    return Array.isArray(answer)
      ? answer.some((a) => equals.includes(a))
      : equals.includes(String(answer));
  }

  return String(answer) === equals;
}   