
import api from "@/shared/api/axiosInstance";

export type QuestionType =
  | "text"
  | "multiple_choice"
  | "checkbox"
  | "rating";

export interface SurveyCondition {
  questionId: string;
  operator: "equals" | "not_equals";
  value: string;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  type: QuestionType;
  required: boolean;
  options: string[];
  condition?: SurveyCondition;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyPayload {
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

export interface SurveyAnswer {
  questionId: string;
  value: string | string[] | number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: string;
  totalAnswers: number;
  responsePercentage: number;
  optionCounts?: Record<string, number>;
  optionPercentages?: Record<string, number>;
  averageRating?: number;
  textAnswers?: string[];
}

export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  totalRatings: number;
  totalTextResponses: number;
  overallAverageRating: number;
  questions: QuestionAnalytics[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface SurveyPagination {
  currentPage: number;
  totalPages: number;
  totalSurveys: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedSurveys {
  surveys: Survey[];
  pagination: SurveyPagination;
}

// Admin survey operations

export async function getAllSurveys(
  page = 1,
  limit = 10,
  search = ""
): Promise<PaginatedSurveys> {
  const response = await api.get<ApiResponse<PaginatedSurveys>>(
    "/surveys",
    {
      params: { page, limit, search },
    }
  );

  return response.data.data;
}

export async function getSurveyById(id: string): Promise<Survey> {
  const response = await api.get<ApiResponse<Survey>>(`/surveys/${id}`);
  return response.data.data;
}

export async function createSurvey(
  payload: SurveyPayload
): Promise<Survey> {
  const response = await api.post<ApiResponse<Survey>>(
    "/surveys",
    payload
  );
  return response.data.data;
}

export async function updateSurvey(
  id: string,
  payload: Partial<SurveyPayload>
): Promise<Survey> {
  const response = await api.put<ApiResponse<Survey>>(
    `/surveys/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteSurvey(id: string): Promise<void> {
  await api.delete(`/surveys/${id}`);
}

export async function publishSurvey(id: string): Promise<Survey> {
  const response = await api.patch<ApiResponse<Survey>>(
    `/surveys/${id}/publish`
  );
  return response.data.data;
}

// Public respondent operations

export async function getPublicSurvey(id: string): Promise<Survey> {
  const response = await api.get<ApiResponse<Survey>>(
    `/public/surveys/${id}`
  );
  return response.data.data;
}

export async function submitSurveyResponse(
  id: string,
  answers: SurveyAnswer[]
): Promise<void> {
  await api.post(
    `/public/surveys/${id}/responses`,
    { answers }
  );
}

// Analytics

export async function getSurveyAnalytics(
  id: string
): Promise<SurveyAnalytics> {
  const response = await api.get<ApiResponse<SurveyAnalytics>>(
    `/analytics/surveys/${id}`
  );
  return response.data.data;
}
