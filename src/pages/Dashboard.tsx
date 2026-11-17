import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BarChart3,
  FileText,
  Trash2,
  Pencil,
  Eye,
  Search,
  CheckCircle2,
  CircleDashed,
  Users,
  Loader2,
  LayoutGrid,
  List,
  X,
  CalendarDays,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAllSurveys,
  getSurveyAnalytics,
  deleteSurvey,
  type Survey,
} from "@/services/survey.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// --- Config & helpers ---
const statusConfig = {
  published: {
    label: "Active",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  draft: {
    label: "Draft",
    icon: CircleDashed,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
} as const;

const PAGE_LIMIT = 10;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// --- Small components ---
function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
  barClass,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof FileText;
  iconClass: string;
  barClass: string;
}) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-1 ${barClass}`} />
      <CardContent className="flex items-start justify-between p-5 pt-6">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-400">{hint}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Survey["status"] }) {
  const config = statusConfig[status] ?? statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function SurveyActions({
  survey,
  deleting,
  onDelete,
}: {
  survey: Survey;
  deleting: boolean;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
        title="Edit survey"
        onClick={() => navigate(`/surveys/${survey.id}/edit`)}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600"
        title="View analytics"
        onClick={() => navigate(`/surveys/${survey.id}/analytics`)}
      >
        <BarChart3 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
        title="Preview survey"
        onClick={() => navigate(`/surveys/${survey.id}/preview`)}
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
        title="Delete survey"
        onClick={() => onDelete(survey.id)}
        disabled={deleting}
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function SkeletonRows({ view }: { view: "list" | "grid" }) {
  const items = Array.from({ length: 5 });

  const grid = (
    <div
      className={`grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 ${
        view === "list" ? "md:hidden" : ""
      }`}
    >
      {items.slice(0, 3).map((_, i) => (
        <div
          key={i}
          className="animate-pulse space-y-4 rounded-2xl border border-slate-100 p-5"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-slate-100" />
            <div className="h-6 w-16 rounded-full bg-slate-100" />
          </div>
          <div className="h-4 w-3/4 rounded bg-slate-100" />
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );

  const rows = (
    <div className="hidden divide-y divide-slate-100 md:block">
      {items.map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-6 py-5">
          <div className="h-10 w-10 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
          <div className="h-6 w-16 rounded-full bg-slate-100" />
          <div className="h-4 w-10 rounded bg-slate-100" />
          <div className="h-4 w-20 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );

  return view === "list" ? (
    <>
      {rows}
      {grid}
    </>
  ) : (
    grid
  );
}

// --- Page ---
export default function Dashboard() {
  const navigate = useNavigate();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>(
    {}
  );

  // searchInput = what the user types, search = debounced value sent to API
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSurveys, setTotalSurveys] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState<"list" | "grid">("list");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchInput.trim();
      setSearch((previous) => {
        if (previous !== value) setCurrentPage(1);
        return value;
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load surveys + response counts
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);

        const result = await getAllSurveys(currentPage, PAGE_LIMIT, search);

        if (cancelled) return;

        setSurveys(result.surveys);
        setTotalPages(result.pagination.totalPages);
        setTotalSurveys(result.pagination.totalSurveys);

        const analyticsResults = await Promise.allSettled(
          result.surveys.map((survey) => getSurveyAnalytics(survey.id))
        );

        if (cancelled) return;

        const counts: Record<string, number> = {};

        analyticsResults.forEach((analytics, index) => {
          const surveyId = result.surveys[index].id;

          counts[surveyId] =
            analytics.status === "fulfilled"
              ? analytics.value.totalResponses
              : 0;
        });

        setResponseCounts(counts);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load dashboard:", error);
          toast.error("Could not load surveys");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [currentPage, search, refreshKey]);

  // Stats (responses and active count cover the current page only)
  const totalResponses = Object.values(responseCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const activeSurveys = surveys.filter(
    (survey) => survey.status === "published"
  ).length;

  async function handleDeleteSurvey(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this survey? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteSurvey(id);

      toast.success("Survey deleted successfully");

      // If it was the last item on this page, go back one page
      if (surveys.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        setRefreshKey((key) => key + 1);
      }
    } catch (error) {
      console.error("Failed to delete survey:", error);
      toast.error("Could not delete survey");
    } finally {
      setDeletingId(null);
    }
  }

  const isSearching = search.length > 0;
  const isEmpty = !loading && surveys.length === 0;

  const searchBox = (className: string) => (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder="Search surveys..."
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        className="h-10 w-full rounded-xl border-slate-200 bg-white pl-10 pr-9 shadow-sm focus-visible:ring-indigo-500"
      />
      {searchInput && (
        <button
          type="button"
          onClick={() => setSearchInput("")}
          className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-[#f7f8fc] to-[#f7f8fc] text-slate-900">
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              {getGreeting()} 👋
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Survey Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Create surveys, collect responses and understand your audience.
            </p>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            {searchBox("min-w-0 flex-1 sm:w-64 sm:flex-none")}

            <Button
              onClick={() => navigate("/surveys/new")}
              className="h-10 shrink-0 gap-2 rounded-xl bg-indigo-600 px-4 shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Survey</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total Surveys"
            value={totalSurveys.toLocaleString()}
            hint={isSearching ? "Matching your search" : "Across your workspace"}
            icon={FileText}
            iconClass="bg-indigo-50 text-indigo-600"
            barClass="bg-indigo-500"
          />
          <StatCard
            label="Total Responses"
            value={totalResponses.toLocaleString()}
            hint="On this page"
            icon={Users}
            iconClass="bg-sky-50 text-sky-600"
            barClass="bg-sky-500"
          />
          <div className="sm:col-span-2 xl:col-span-1">
            <StatCard
              label="Active Surveys"
              value={activeSurveys.toLocaleString()}
              hint="On this page"
              icon={Activity}
              iconClass="bg-emerald-50 text-emerald-600"
              barClass="bg-emerald-500"
            />
          </div>
        </div>

        {/* Survey list */}
        <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Your Surveys</h2>
              <p className="mt-0.5 text-sm text-slate-400">
                {isSearching
                  ? `${totalSurveys} result${totalSurveys === 1 ? "" : "s"} for "${search}"`
                  : "Manage, edit and track your survey performance."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle (desktop only; phones always use cards) */}
              <div className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 p-1 md:flex">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    view === "list"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="List view"
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    view === "grid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Card view"
                  aria-label="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-slate-200"
                onClick={() => navigate("/surveys/new")}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Create new
              </Button>
            </div>
          </div>

          <CardContent className="p-0">
            {loading ? (
              <SkeletonRows view={view} />
            ) : isEmpty ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-800">
                  {isSearching ? "No surveys found" : "No surveys yet"}
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-400">
                  {isSearching
                    ? `Nothing matches "${search}". Try a different search.`
                    : "Create your first survey to start collecting responses."}
                </p>

                {isSearching ? (
                  <Button
                    variant="outline"
                    className="mt-6 rounded-xl border-slate-200"
                    onClick={() => setSearchInput("")}
                  >
                    Clear search
                  </Button>
                ) : (
                  <Button
                    className="mt-6 rounded-xl bg-indigo-600 shadow-md shadow-indigo-200 hover:bg-indigo-700"
                    onClick={() => navigate("/surveys/new")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first survey
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Table view */}
                {view === "list" && (
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                          <TableHead className="h-12 pl-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Survey
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Status
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Questions
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Responses
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Created
                          </TableHead>
                          <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {surveys.map((survey) => (
                          <TableRow
                            key={survey.id}
                            className="border-slate-100 transition-colors hover:bg-indigo-50/30"
                          >
                            <TableCell className="py-4 pl-6">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/surveys/${survey.id}/edit`)
                                }
                                className="flex w-full items-center gap-3 text-left"
                              >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-800 transition-colors hover:text-indigo-600">
                                    {survey.title}
                                  </p>
                                  <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
                                    {survey.description || "No description"}
                                  </p>
                                </div>
                              </button>
                            </TableCell>

                            <TableCell>
                              <StatusBadge status={survey.status} />
                            </TableCell>

                            <TableCell>
                              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                                <ListChecks className="h-4 w-4 text-slate-300" />
                                {survey.questions.length}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                                <Users className="h-4 w-4 text-slate-300" />
                                {(responseCounts[survey.id] ?? 0).toLocaleString()}
                              </span>
                            </TableCell>

                            <TableCell className="text-sm text-slate-400">
                              {formatDate(survey.createdAt)}
                            </TableCell>

                            <TableCell className="pr-6">
                              <div className="flex justify-end">
                                <SurveyActions
                                  survey={survey}
                                  deleting={deletingId === survey.id}
                                  onDelete={handleDeleteSurvey}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Card view (always on phones, optional on desktop) */}
                <div
                  className={`grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 ${
                    view === "list" ? "md:hidden" : ""
                  }`}
                >
                  {surveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <StatusBadge status={survey.status} />
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/surveys/${survey.id}/edit`)}
                        className="mt-4 text-left"
                      >
                        <h3 className="line-clamp-1 font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">
                          {survey.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-400">
                          {survey.description || "No description"}
                        </p>
                      </button>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                            Questions
                          </p>
                          <p className="mt-0.5 text-lg font-bold text-slate-800">
                            {survey.questions.length}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                            Responses
                          </p>
                          <p className="mt-0.5 text-lg font-bold text-slate-800">
                            {(responseCounts[survey.id] ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(survey.createdAt)}
                        </span>

                        <SurveyActions
                          survey={survey}
                          deleting={deletingId === survey.id}
                          onDelete={handleDeleteSurvey}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {surveys.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                      {totalSurveys}
                    </span>{" "}
                    surveys
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1 rounded-lg border-slate-200 bg-white"
                      disabled={currentPage <= 1 || loading}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
                      {currentPage} / {Math.max(1, totalPages)}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1 rounded-lg border-slate-200 bg-white"
                      disabled={currentPage >= totalPages || loading}
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-400">
          SurveyFlow · Manage feedback with confidence
        </p>
      </main>
    </div>
  );
}