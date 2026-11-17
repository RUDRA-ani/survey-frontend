
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  type RouteObject,
} from "react-router-dom";

// Layouts & Guards
import { AuthLayout } from "@/layout/AuthLayout";
import { ProtectedLayout } from "@/layout/ProtectedLayout";

// Auth Pages
import Login from "@/features/auth/pages/Login";
 
// Dashboard Pages
import Dashboard from "@/pages/Dashboard";
import SurveyBuilder from "@/features/surveys/pages/SurveyBuilder";
import SurveyAnalytics from "@/features/surveys/pages/SurveyAnalytics";
import SurveyPreview from "@/features/surveys/pages/SurveyPreview";
import PublicSurvey from "@/features/surveys/pages/PublicSurvey";

const protectedRoutes: RouteObject[] = [
  { path: "/surveys/new", element: <SurveyBuilder /> },
  { path: "/surveys/:id/edit", element: <SurveyBuilder /> },
  { path: "/surveys/:id/analytics", element: <SurveyAnalytics /> },
  { path: "/surveys/:id/preview", element: <SurveyPreview /> },
];

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
         </Route>

        {/* Public respondent survey - no admin login */}
        <Route path="/s/:id" element={<PublicSurvey />} />

        {/* Protected admin routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />

          {protectedRoutes.map((route, index) => (
            <Route
              key={route.path || index}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
