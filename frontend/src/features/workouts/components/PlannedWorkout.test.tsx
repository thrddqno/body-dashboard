import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { SelectedDayPanel } from "@/features/dashboard/components/SelectedDayPanel";
import type { PlannedWorkout, TrainingPlan } from "@/types/plannedWorkout";
import type { Workout } from "@/types/workout";

const plans: Record<string, PlannedWorkout> = {
  "2026-09-01": {
    type: "workout",
    title: "Lower A",
    subtitle: "Lower body strength and core",
    warmup: [],
    exercises: [
      { name: "Leg Press", setPrescription: "3 sets" },
      { name: "Seated Leg Curl", setPrescription: "3 sets" },
      { name: "Supported Split Squat", setPrescription: "2-3 sets" },
      { name: "Hip Thrust Machine", setPrescription: "3 sets" },
      { name: "Calf Raise", setPrescription: "3 sets" },
      { name: "Pallof Press", setPrescription: "2-3 sets" },
    ],
    guardrails: ["Keep technique controlled.", "Avoid grinding reps."],
  },
  "2026-09-02": {
    type: "rest",
    title: "Rest",
    subtitle: "Onsite workday",
    warmup: [],
    exercises: [],
    guardrails: ["This is an intentional rest day."],
  },
  "2026-09-03": {
    type: "rest",
    title: "Rest",
    subtitle: "Recovery day",
    warmup: [],
    exercises: [],
    guardrails: ["This is an intentional rest day."],
  },
  "2026-09-04": {
    type: "rest",
    title: "Rest",
    subtitle: "Onsite workday",
    warmup: [],
    exercises: [],
    guardrails: ["This is an intentional rest day."],
  },
  "2026-09-05": {
    type: "workout",
    title: "Upper B",
    subtitle: "Upper body strength",
    warmup: [],
    exercises: [
      { name: "Incline Dumbbell Press", setPrescription: "3 sets" },
      { name: "Seated Cable Row", setPrescription: "3 sets" },
      { name: "Neutral-Grip Pulldown", setPrescription: "3 sets" },
      { name: "Seated Machine Shoulder Press", setPrescription: "2-3 sets" },
      { name: "Reverse Pec Deck", setPrescription: "3 sets" },
      { name: "Lateral Raise", setPrescription: "2 sets" },
      { name: "Rope Pressdown", setPrescription: "2 sets" },
      { name: "Cable Curl", setPrescription: "2 sets" },
    ],
    guardrails: [],
  },
  "2026-09-06": {
    type: "workout",
    title: "Lower B",
    subtitle: "Lower body strength and core",
    warmup: [],
    exercises: [{
      name: "Hip Thrust Machine",
      setPrescription: "2-3 sets",
      notes: "Romanian Deadlift is optional when your back is comfortable. Use Hip Thrust Machine instead if you report back discomfort.",
    }],
    guardrails: ["Do not use Romanian Deadlifts when back discomfort is present."],
    optional: ["10-20 minutes easy cardio"],
  },
  "2026-09-07": {
    type: "workout",
    title: "Upper A",
    subtitle: "Upper body strength",
    warmup: [],
    exercises: [
      { name: "Machine Chest Press", setPrescription: "3 sets" },
      { name: "Chest-Supported Row", setPrescription: "3 sets" },
      { name: "Incline Dumbbell Press", setPrescription: "3 sets" },
      { name: "Lat Pulldown", setPrescription: "3 sets" },
      { name: "Lateral Raise", setPrescription: "3 sets" },
      { name: "Rope Pressdown", setPrescription: "2 sets" },
      { name: "Cable Curl", setPrescription: "2 sets" },
    ],
    guardrails: [
      "Generally keep 1-3 reps in reserve on working sets.",
      "Prioritize clean technique and progressive overload.",
    ],
  },
};

const planMetadata: Record<string, Pick<TrainingPlan, "dayOfWeek" | "workoutType">> = {
  "2026-09-01": { dayOfWeek: "TUESDAY", workoutType: "LOWER_A" },
  "2026-09-02": { dayOfWeek: "WEDNESDAY", workoutType: "REST" },
  "2026-09-03": { dayOfWeek: "THURSDAY", workoutType: "REST" },
  "2026-09-04": { dayOfWeek: "FRIDAY", workoutType: "REST" },
  "2026-09-05": { dayOfWeek: "SATURDAY", workoutType: "UPPER_B" },
  "2026-09-06": { dayOfWeek: "SUNDAY", workoutType: "LOWER_B" },
  "2026-09-07": { dayOfWeek: "MONDAY", workoutType: "UPPER_A" },
};

function getPlannedWorkout(date: string): TrainingPlan {
  return { ...plans[date], ...planMetadata[date], date };
}

const completedWorkout: Workout = {
  id: 1,
  date: "2026-09-01",
  workoutType: "LOWER_A",
  status: "COMPLETED",
  notes: "Felt strong today",
  exercises: [],
  createdAt: "2026-09-01T08:00:00",
  updatedAt: "2026-09-01T08:00:00",
};

function renderPanel(
  date: string,
  workouts: Workout[] = [],
  plan: TrainingPlan = getPlannedWorkout(date),
  today?: string,
) {
  return render(
    <MemoryRouter>
      <SelectedDayPanel today={today} selectedDate={date} workouts={workouts} plan={plan} />
    </MemoryRouter>,
  );
}

describe("Planned workout fallback", () => {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 1, 12));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it.each([
    ["2026-09-01", "Lower A", "workout"],
    ["2026-09-02", "Rest", "rest"],
    ["2026-09-03", "Rest", "rest"],
    ["2026-09-04", "Rest", "rest"],
    ["2026-09-05", "Upper B", "workout"],
    ["2026-09-06", "Lower B", "workout"],
    ["2026-09-07", "Upper A", "workout"],
  ])("resolves %s to %s", (date, title, type) => {
    const plan = getPlannedWorkout(date);
    expect(plan.title).toBe(title);
    expect(plan.type).toBe(type);
  });

  it("shows a completed workout instead of the planned workout", () => {
    renderPanel("2026-09-01", [completedWorkout]);

    expect(screen.getByText("Lower A")).toBeInTheDocument();
    expect(screen.getByText("Felt strong today")).toBeInTheDocument();
    expect(screen.queryByText("Today's Plan")).not.toBeInTheDocument();
  });

  it("renders a complete workout plan with exact set prescriptions", () => {
    renderPanel("2026-09-07");

    expect(screen.getByText("Monday's Plan")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upper A" })).toBeInTheDocument();
    expect(screen.getByText("Chest-Supported Row")).toBeInTheDocument();
    expect(screen.getAllByText("3 sets").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Generally keep 1-3 reps in reserve on working sets.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log Workout" })).toHaveAttribute("href", "/workouts/");
  });

  it("renders exact set ranges without requiring rep targets", () => {
    renderPanel("2026-09-01");

    expect(screen.getByText("Supported Split Squat")).toBeInTheDocument();
    expect(screen.getAllByText("2-3 sets").length).toBeGreaterThanOrEqual(1);
  });

  it("uses the dashboard date for the relative plan label", () => {
    renderPanel("2026-09-02", [], getPlannedWorkout("2026-09-02"), "2026-09-02");

    expect(screen.getByText("Today's Plan")).toBeInTheDocument();
    expect(screen.queryByText("Tomorrow's Plan")).not.toBeInTheDocument();
  });

  it("renders Lower B substitutions, back guidance, and optional cardio", () => {
    renderPanel("2026-09-06");

    expect(screen.getByText(/Romanian Deadlift is optional/)).toBeInTheDocument();
    expect(screen.getByText("Do not use Romanian Deadlifts when back discomfort is present.")).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getByText("10-20 minutes easy cardio")).toBeInTheDocument();
  });

  it.each([
    ["2026-09-02", "Onsite workday", "Tomorrow's Plan"],
    ["2026-09-03", "Recovery day", "Thursday's Plan"],
    ["2026-09-04", "Onsite workday", "Friday's Plan"],
  ])("renders %s as an intentional rest day", (date, subtitle, eyebrow) => {
    renderPanel(date);

    expect(screen.getByRole("heading", { name: "Rest" })).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
    expect(screen.getByText(eyebrow)).toBeInTheDocument();
    expect(screen.getByText("This is an intentional rest day.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Log Workout" })).not.toBeInTheDocument();
  });

  it("links an existing planned workout to editing", () => {
    const plannedUpperWorkout: Workout = {
      ...completedWorkout,
      id: 2,
      workoutType: "UPPER_B",
      status: "PLANNED",
      notes: null,
    };

    renderPanel("2026-09-01", [plannedUpperWorkout], {
      ...getPlannedWorkout("2026-09-05"),
      date: "2026-09-01",
      dayOfWeek: "TUESDAY",
    });

    expect(screen.getAllByRole("heading", { name: "Upper B" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Edit Workout" })).toHaveAttribute("href", "/workouts/2");
    expect(screen.queryByRole("link", { name: "Log Workout" })).not.toBeInTheDocument();
  });

});
