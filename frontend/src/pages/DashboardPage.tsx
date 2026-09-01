import { useEffect, useState } from "react";

import { getWeeklyAnalytics } from "@/api/analyticsApi";
import { getLatestWeeklyAiAnalysis } from "@/api/aiAnalysisApi";
import { getDashboard } from "@/api/dashboardApi";
import { ApiError } from "@/api/httpClient";
import { listWorkoutPage, listWorkoutsByDateRange } from "@/api/workoutsApi";
import { getTrainingPlan } from "@/api/trainingPlansApi";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { CoachNotes } from "@/features/dashboard/components/CoachNotes";
import { DashboardSidePanels } from "@/features/dashboard/components/DashboardSidePanels";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { SelectedDayPanel } from "@/features/dashboard/components/SelectedDayPanel";
import { WeeklyCalendar } from "@/features/dashboard/components/WeeklyCalendar";
import { WeeklySummary } from "@/features/dashboard/components/WeeklySummary";
import { WorkoutLog } from "@/features/dashboard/components/WorkoutLog";
import type { WeeklyAnalytics } from "@/types/analytics";
import type { WeeklyAiAnalysis } from "@/types/aiAnalysis";
import type { DashboardResponse } from "@/types/dashboard";
import type { Workout } from "@/types/workout";
import type { TrainingPlan } from "@/types/plannedWorkout";
import { getWeekDates } from "@/utils/dates";
import { formatFullDateString } from "@/utils/formatters";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [analytics, setAnalytics] = useState<WeeklyAnalytics | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [workoutHistoryPage, setWorkoutHistoryPage] = useState(0);
  const [workoutHistoryPageSize, setWorkoutHistoryPageSize] = useState(7);
  const [workoutHistoryTotalElements, setWorkoutHistoryTotalElements] = useState(0);
  const [workoutHistoryTotalPages, setWorkoutHistoryTotalPages] = useState(0);
  const [isWorkoutHistoryLoading, setIsWorkoutHistoryLoading] = useState(true);
  const [workoutHistoryError, setWorkoutHistoryError] = useState<string>();
  const [workoutHistoryRequest, setWorkoutHistoryRequest] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [latestAnalysis, setLatestAnalysis] = useState<WeeklyAiAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState<string>();
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [trainingPlanError, setTrainingPlanError] = useState<{ date: string; message: string }>();

  useEffect(() => {
    const controller = new AbortController();

    async function loadPage() {
      setIsLoading(true);
      setError(undefined);

      try {
        const [dashboardResponse, analyticsResponse] = await Promise.all([
          getDashboard(controller.signal),
          getWeeklyAnalytics(controller.signal),
        ]);
        const workoutsResponse = await listWorkoutsByDateRange(
          analyticsResponse.period.start,
          analyticsResponse.period.end,
          controller.signal,
        );

        setDashboard(dashboardResponse);
        setAnalytics(analyticsResponse);
        setWorkouts(workoutsResponse);
        setSelectedDate(dashboardResponse.today.date);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadPage();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWorkoutHistory() {
      setIsWorkoutHistoryLoading(true);
      setWorkoutHistoryError(undefined);

      try {
        const response = await listWorkoutPage(
          workoutHistoryPage,
          workoutHistoryPageSize,
          controller.signal,
        );
        if (controller.signal.aborted) return;

        if (response.totalPages > 0 && workoutHistoryPage >= response.totalPages) {
          setWorkoutHistoryPage(response.totalPages - 1);
          return;
        }
        if (response.totalPages === 0 && workoutHistoryPage > 0) {
          setWorkoutHistoryPage(0);
          return;
        }

        setWorkoutHistory(response.workouts);
        setWorkoutHistoryTotalElements(response.totalElements);
        setWorkoutHistoryTotalPages(response.totalPages);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setWorkoutHistoryError(
          loadError instanceof Error ? loadError.message : "Unable to load workout history.",
        );
      } finally {
        if (!controller.signal.aborted) setIsWorkoutHistoryLoading(false);
      }
    }

    void loadWorkoutHistory();
    return () => controller.abort();
  }, [workoutHistoryPage, workoutHistoryPageSize, workoutHistoryRequest]);

  useEffect(() => {
    if (!selectedDate) return;

    const controller = new AbortController();
    const plannedWorkout = workouts
      .filter((workout) => workout.date === selectedDate && workout.status === "PLANNED")
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

    getTrainingPlan(selectedDate, controller.signal, plannedWorkout?.workoutType)
      .then((plan) => {
        setTrainingPlan(plan);
        setTrainingPlanError(undefined);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setTrainingPlanError({ date: selectedDate, message: "Unable to load the training plan." });
      });

    return () => controller.abort();
  }, [selectedDate, workouts]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLatestAnalysis() {
      try {
        setLatestAnalysis(await getLatestWeeklyAiAnalysis(controller.signal));
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        if (!(loadError instanceof ApiError && loadError.status === 404)) {
          setAnalysisError("Saved analysis is temporarily unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) setIsAnalysisLoading(false);
      }
    }

    void loadLatestAnalysis();
    return () => controller.abort();
  }, []);

  if (isLoading) {
    return <LoadingState label="Loading dashboard" />;
  }

  if (error || !dashboard || !analytics) {
    return <ErrorState message={error ?? "Unable to load dashboard."} />;
  }

  const weekDates = getWeekDates(analytics.period.start, analytics.period.end);
  const workoutsByDate = workouts.reduce<Record<string, Workout[]>>((accumulator, workout) => {
    accumulator[workout.date] = [...(accumulator[workout.date] ?? []), workout];
    return accumulator;
  }, {});
  const selectedDayWorkouts = workoutsByDate[selectedDate] ?? [];
  const selectedTrainingPlan = trainingPlan?.date === selectedDate ? trainingPlan : null;
  const selectedTrainingPlanError = trainingPlanError?.date === selectedDate ? trainingPlanError.message : undefined;
  const periodLabel = `${formatFullDateString(analytics.period.start)} - ${formatFullDateString(analytics.period.end)}`;

  return (
    <main>
      <DashboardHeader today={dashboard.today.date} periodLabel={periodLabel} />
      <WeeklySummary analytics={analytics} />
      <WeeklyCalendar
        dates={weekDates}
        today={dashboard.today.date}
        workoutsByDate={workoutsByDate}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <div className="mt-6">
        <SelectedDayPanel
          selectedDate={selectedDate}
          workouts={selectedDayWorkouts}
          plan={selectedTrainingPlan}
          planError={selectedTrainingPlanError}
        />
      </div>
      <div className="dashboard-body grid grid-cols-[minmax(0,1.65fr)_minmax(260px,0.75fr)] gap-[26px] pb-9 pt-[88px]">
        <div className="min-w-0">
          <CoachNotes analysis={latestAnalysis} isLoading={isAnalysisLoading} error={analysisError} />
          <WorkoutLog
            workouts={workoutHistory}
            page={workoutHistoryPage}
            pageSize={workoutHistoryPageSize}
            totalElements={workoutHistoryTotalElements}
            totalPages={workoutHistoryTotalPages}
            isLoading={isWorkoutHistoryLoading}
            error={workoutHistoryError}
            onPageChange={setWorkoutHistoryPage}
            onPageSizeChange={(pageSize) => {
              setWorkoutHistoryPageSize(pageSize);
              setWorkoutHistoryPage(0);
            }}
            onRetry={() => setWorkoutHistoryRequest((request) => request + 1)}
          />
        </div>
        <DashboardSidePanels
          dashboard={dashboard}
          analytics={analytics}
          latestAnalysis={latestAnalysis}
          hasAnalysis={!isAnalysisLoading && latestAnalysis != null}
        />
      </div>
    </main>
  );
}
