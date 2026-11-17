export type QuestionType = "text" | "multiple_choice" | "checkbox" | "rating";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[]; // for multiple_choice & checkbox
  // Conditional logic
  visibleIf?: {
    questionId: string;
    equals: string | string[];
  };
}

export interface SurveySchema {
  title: string;
  description: string;
  questions: Question[];
}

export type FormValues = Record<string, string | string[] | number>;   