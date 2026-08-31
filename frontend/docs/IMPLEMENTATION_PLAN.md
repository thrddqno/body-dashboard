# Frontend Implementation Plan

## Goal

Implement the Body Dashboard frontend end-to-end using the existing backend APIs as the source of truth.

Do not invent unsupported fields, endpoints, analytics, edit flows, or AI results.

## Required Reading

Read before implementation:

1. `/AGENTS.md`
2. `/README.md`
3. `/frontend/docs/PROMPT.md`
4. `/frontend/docs/design/DESIGN.md`
5. `/backend/docs/API.md`
6. `/backend/docs/DATA_MODEL.md`
7. `/backend/docs/ANALYTICS_AND_AI.md`
8. `/backend/docs/AUDIT.md`
9. `/backend/docs/OPERATIONS.md`
10. Backend controllers, DTOs, enums, and exception responses under `backend/src/main/java/com/antonio/bodydashboard`

If docs disagree with backend code, follow backend code.

## Required Dependencies

Add only these runtime dependencies unless a real need appears:

- `react-router-dom`
- `recharts`

Add test dependencies only if missing and needed for the requested checks:

- `vitest`
- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`

Do not add Axios, TanStack Query, a form library, or a date library by default.

## Supported Routes

Create only real, backend-supported destinations:

- `/` dashboard
- `/measurements`
- `/workouts`
- `/workouts/:id`
- `/daily-log/:date?`
- `/analytics`
- `/analysis`
- `*` not found

Do not add empty navigation items for unsupported sections.

## Backend Contracts

Mirror backend request and response shapes exactly.

### Body Metrics

- `GET /api/body-metrics`
- `GET /api/body-metrics/{id}`
- `POST /api/body-metrics`

Fields:

- `id: number`
- `date: string` as `YYYY-MM-DD`
- `weightKg: number`
- `waistCm: number | null`
- `bodyFatPercentage: number | null`
- `createdAt: string`

Request fields:

- `date`
- `weightKg`
- `waistCm?`
- `bodyFatPercentage?`

Important limitation:

- no edit
- no delete
- no pagination

### Daily Logs

- `GET /api/daily-logs/{date}`
- `PUT /api/daily-logs/{date}`

Fields:

- `id: number`
- `date: string`
- `sleepMinutes: number | null`
- `steps: number | null`
- `energy: "VERY_LOW" | "LOW" | "AVERAGE" | "HIGH" | "VERY_HIGH" | null`
- `painNotes: string | null`
- `recoveryNotes: string | null`
- `estimatedCalories: number | null`
- `estimatedProteinGrams: number | null`
- `createdAt: string`
- `updatedAt: string`

Important semantics:

- `404` means no log exists for that date
- `PUT` is full replacement
- omitted fields are cleared
- `{}` is valid
- no delete endpoint
- no list or range endpoint

### Workouts

- `GET /api/workouts`
- `GET /api/workouts/{id}`
- `POST /api/workouts`
- `PATCH /api/workouts/{id}/status`

Enums:

- `WorkoutStatus = "PLANNED" | "COMPLETED" | "MISSED"`

Workout response fields:

- `id`
- `date`
- `workoutType`
- `status`
- `notes`
- `exercises[]`
- `createdAt`
- `updatedAt`

Exercise fields:

- `id`
- `exerciseName`
- `orderIndex`
- `sets[]`

Set fields:

- `id`
- `setNumber`
- `weightKg`
- `reps`
- `rir`
- `warmup`

Important limitation:

- no workout edit
- no workout delete
- only status can change after creation
- no filters or pagination

### Dashboard

- `GET /api/dashboard`

Returned sections:

- `today.date`
- `today.dailyLog`
- `body.currentWeightKg`
- `body.recentMetrics[]`
- `training.latestWorkout`
- `training.completedThisWeek`
- `training.missedThisWeek`

### Deterministic Analytics

- `GET /api/analytics/weekly`

Returned sections:

- `period.start`
- `period.end`
- `body.latestWeightKg`
- `body.weightChangeKg`
- `recovery.averageSleepHours`
- `recovery.averageSteps`
- `training.completedWorkouts`
- `training.missedWorkouts`
- `training.adherencePercentage`

Do not recreate analytics independently in the frontend.

### Weekly AI Analysis

- `POST /api/ai-analysis/weekly`

Returned sections:

- `summary`
- `knownFacts[]`
- `interpretation[]`
- `strengths[]`
- `concerns[]`
- `recommendations[]`
- `dataGaps[]`

Important limitation:

- result is not persisted
- `200` may still mean insufficient data or AI not configured
- `503` means provider failure

### Backend Error Shape

Parse and use this response shape when present:

```ts
type BackendApiError = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors: Record<string, string>;
};
```

Show field-level errors in forms when available.

## Implementation Steps

### 1. Strengthen the app foundation

- Add router setup in `App.tsx` and `main.tsx`
- Create an application shell with navigation
- Keep navigation responsive for mobile and desktop
- Add not-found handling

### 2. Centralize API and error handling

- Keep all network calls in `src/api/`
- Upgrade the HTTP client to parse backend error payloads
- Preserve status code, message, and `fieldErrors`
- Distinguish network failures from backend failures
- Support `signal` for request cancellation where useful
- Do not set `Content-Type: application/json` for bodyless requests

### 3. Add exact domain types

- Create TypeScript types for body metrics, daily logs, workouts, analytics, AI analysis, and API errors
- Mirror backend nullability exactly
- Keep API DTOs separate from form state when inputs need empty strings

### 4. Add shared UI primitives

Implement reusable components only where repetition exists:

- `AppShell`
- `PageHeader`
- `LoadingState`
- `ErrorState`
- `EmptyState`
- `StatusBadge`
- `FieldError`
- `ChartPanel`

All major screens must support loading, empty, partial, and error states.

### 5. Implement the dashboard

Integrate real data from:

- `/api/dashboard`
- `/api/analytics/weekly`
- `/api/workouts`

Dashboard must show only supported information, such as:

- current weight
- recent body metrics
- latest workout
- completed and missed weekly workouts
- adherence
- average sleep
- average steps
- selected-day workout details from actual workout data
- a clear entry point to the selected-day daily log

Do not invent:

- training phase
- target weight
- coaching guardrails
- fake planned workout content

### 6. Implement measurements

Create a measurements page with:

- latest measurement summary
- historical list or table
- real date-based chart with sparse-data support
- create measurement form

Rules:

- no edit control
- no delete control
- duplicate-date errors must show backend feedback
- missing optional values stay missing

### 7. Implement workouts

Create:

- workout list page
- workout creation flow
- workout detail page
- status update control

Rules:

- workout create supports nested exercises and sets
- use stable client keys for dynamic rows
- generate positive `orderIndex` and `setNumber`
- keep `rir` optional
- allow zero weight where valid
- after creation, treat all fields as immutable except status

### 8. Implement selected-date daily logs

Create a daily log page with:

- date picker or route date
- fetch by exact date
- save by exact date
- sleep, steps, energy, pain, recovery, calories, protein fields

Rules:

- treat `404` as no record for that date
- submitting must send the full record state
- make it clear that saving replaces the full daily record
- do not add fake history or unsupported daily trend charts

### 9. Implement deterministic analytics page

Create a page for current-week deterministic analytics using only `/api/analytics/weekly`.

Show:

- period range
- latest weekly weight
- weight change
- average sleep
- average steps
- completed workouts
- missed workouts
- adherence

Label this as deterministic analytics.

### 10. Implement weekly AI analysis page

Create an explicit generation flow using `/api/ai-analysis/weekly`.

Rules:

- use a button like `Generate weekly analysis`
- do not auto-generate on page load
- clearly separate facts from AI interpretation
- render all returned sections
- handle insufficient-data `200` responses normally
- handle `503` with retry messaging
- state that the result is not persisted

### 11. Responsive and accessibility pass

- ensure navigation works on mobile
- use semantic headings, buttons, labels, and lists
- associate labels with inputs
- use `aria-live` for mutation feedback where useful
- ensure keyboard navigation works
- do not communicate important status by color alone
- keep charts readable on small screens

### 12. Focused tests

Add targeted tests for:

- HTTP error parsing
- date utilities without timezone drift
- missing values rendering as missing, not zero
- daily-log `404` empty-form behavior
- daily-log full-record `PUT` behavior
- body-metric form validation and backend error rendering
- workout creation with dynamic exercises and sets
- workout status update
- AI insufficient-data and `503` states
- route rendering and not-found behavior

Avoid snapshot-heavy tests.

## File Organization Guidance

Prefer feature-based structure:

```text
frontend/src/
├── api/
├── components/
├── features/
├── hooks/
├── pages/
├── types/
└── utils/
```

Do not put business rules inside presentation-heavy React components.

## Explicit Backend Limitations

Reflect these honestly in the UI:

- body metrics cannot be edited
- body metrics cannot be deleted
- workouts cannot be edited after creation except for status
- workouts cannot be deleted
- daily logs have no list or date-range endpoint
- daily logs have no real delete endpoint
- AI analysis is not persisted
- dashboard is only for the backend's current date/week
- no separate nutrition history API exists
- no target-weight or training-phase backend model exists

Do not hide these limitations by inventing client-side behavior.

## Verification Commands

Run after implementation:

```bash
cd frontend
npm install
npm run lint
npm run typecheck
npm run test:run
npm run build
```

When backend verification is relevant:

```bash
docker compose up -d postgres
cd backend
./mvnw test
./mvnw spring-boot:run
```

## Definition Of Done

The work is done when:

- the app builds successfully
- routes are navigable and useful
- real backend APIs are integrated
- supported create/update flows work
- deterministic analytics are shown without reimplementing backend business logic
- AI analysis is clearly labeled and genuinely integrated
- missing data is shown as missing
- loading, empty, error, and mutation-failure states exist
- responsive behavior is usable
- tests and build pass
- no placeholder or fake domain content remains

## Suggested Model

Recommended implementation model:

- `gpt-5.3-codex` with medium reasoning

Reason:

- large enough to complete the full vertical slice
- still efficient for structured implementation work
- less likely to stop after scaffolding or mishandle backend nullability
