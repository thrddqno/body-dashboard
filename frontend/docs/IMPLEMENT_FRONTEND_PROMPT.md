# Implement Body Dashboard Frontend

Implement the frontend end-to-end.

Do not stop after scaffolding, partial pages, or isolated components.

## Read First

Read these before making changes:

1. `/AGENTS.md`
2. `/README.md`
3. `/frontend/docs/PROMPT.md`
4. `/frontend/docs/IMPLEMENTATION_PLAN.md`
5. `/frontend/docs/design/DESIGN.md`
6. `/backend/docs/API.md`
7. `/backend/docs/DATA_MODEL.md`
8. `/backend/docs/ANALYTICS_AND_AI.md`
9. `/backend/docs/AUDIT.md`
10. `/backend/docs/OPERATIONS.md`
11. Backend controllers, DTOs, enums, services, and exception responses under `backend/src/main/java/com/antonio/bodydashboard`

If documentation disagrees with backend code, backend code is the source of truth.

## Objective

Build a complete, usable frontend for Body Dashboard using the current backend contracts.

Use the implementation plan exactly unless backend code proves it wrong.

## Non-Negotiable Rules

- Do not invent endpoints.
- Do not invent fields.
- Do not invent analytics.
- Do not invent workout history.
- Do not invent AI output.
- Do not fabricate missing measurements or substitute missing values with zero.
- Do not create empty navigation pages.
- Do not add authentication.
- Do not redesign the app away from the documented visual direction.
- Do not stop after building structure without real data integration.

## Required Scope

Implement the frontend areas supported by the backend:

- dashboard
- measurements
- workouts
- workout detail
- selected-date daily log and nutrition fields
- deterministic weekly analytics
- weekly AI analysis
- application shell and navigation
- loading, empty, error, and mutation feedback states
- responsive behavior
- focused tests

## Required Dependencies

Add only what is needed:

- `react-router-dom`
- `recharts`

Add test dependencies only if required by the implementation plan.

Avoid unnecessary libraries.

## API Rules

- Centralize API logic under `frontend/src/api/`
- Parse backend error payloads, including `fieldErrors`
- Keep request/response types aligned to backend DTOs
- Treat daily-log `404` as an empty record only for that exact screen
- Respect daily-log full-replacement semantics
- Treat workout records as immutable after creation except for status
- Treat body metrics as create-and-list only

## UX Rules

- Missing values must display as missing or unavailable
- Facts, deterministic analytics, and AI interpretation must be visually distinct
- Use charts only where they communicate better than tables or text
- Charts must handle sparse and one-point datasets honestly
- Mobile must preserve usable information hierarchy

## Backend Limitations To Respect

- no body metric edit or delete
- no workout edit or delete
- no daily-log list or history endpoint
- no real daily-log delete endpoint
- no persisted AI history
- no target weight field
- no training phase field
- no historical analytics range endpoint

Reflect these honestly in the UI. Do not hide them with fake client logic.

## Implementation Requirements

Follow the steps in `/frontend/docs/IMPLEMENTATION_PLAN.md` and complete the entire flow.

At minimum, ensure:

1. routes are implemented and navigable
2. shared app shell exists
3. API and error handling are centralized
4. dashboard uses real backend data
5. measurements can be viewed and created
6. workouts can be viewed, created, and status-updated
7. daily logs can be viewed and saved by date
8. deterministic analytics use backend output only
9. AI analysis uses the backend endpoint and clearly labels AI-generated content
10. loading, empty, and error states exist across major screens
11. tests and build pass

## Diagnostics And Validation

Run and fix issues from:

```bash
cd frontend
npm install
npm run lint
npm run typecheck
npm run test:run
npm run build
```

When needed for integration:

```bash
docker compose up -d postgres
cd backend
./mvnw test
./mvnw spring-boot:run
```

Do not ignore failures introduced by your changes.

## Completion Standard

Do not claim completion unless:

- the frontend builds
- routes work
- backend APIs are actually integrated
- supported create/update flows work
- diagnostics pass
- placeholder content is removed
- remaining gaps are genuine backend limitations only

## Final Report Format

When finished, report using these sections:

- `Implemented`
- `Architecture`
- `API Coverage`
- `Validation`
- `Remaining Gaps`

Only list genuine remaining gaps. Do not describe incomplete work as done.

## Suggested Model

Use `gpt-5.3-codex` with medium reasoning.
