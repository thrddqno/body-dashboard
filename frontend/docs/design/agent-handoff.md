# Body Dashboard Agent Handoff

Read this before changing the Body Dashboard. It tells a future agent what the site is, which files matter, and which behavior must stay intact.

## What This Site Is

Body Dashboard is Antonio's fitness dashboard. It displays a structured `DashboardPayload` containing:

- Weekly metrics.
- Weekly review.
- Progression gate.
- Coach notes.
- Recent workout, rest, recovery, food, and daily check-in entries.
- A timezone-aware week calendar with planned training and guardrails.

The site is currently a static viewer backed by `app/data/mockDashboard.ts`. The UI should render what the data says. It should not infer missing values on its own.

## Essential Files

| File | Purpose |
|---|---|
| `app/page.tsx` | Root page layout and section order |
| `app/globals.css` | Design tokens, component styling, responsive behavior |
| `app/data/mockDashboard.ts` | Current static dashboard payload |
| `app/types/dashboard.ts` | Type contract for dashboard data |
| `app/services/dashboardApi.ts` | Payload access layer |
| `app/components/SummaryStrip.tsx` | Weekly metric strip |
| `app/components/WeekCalendar.tsx` | Timezone-aware weekly plan UI |
| `app/components/MessageFeed.tsx` | Coach notes |
| `app/components/WorkoutLogView.tsx` | Expandable workout timeline |
| `app/components/WeeklyReview.tsx` | Side-panel weekly review |
| `app/components/ProgressionGate.tsx` | Gate decision card |
| `app/contracts/api-contract.md` | Intended API/data behavior |
| `design.md` | Visual and product design reference |
| `tokens.md` | Extracted design tokens |

## Data Contract

The rendered payload type is `DashboardPayload`.

When updating data:

- Preserve ISO dates as `YYYY-MM-DD`.
- Preserve timezone as `Asia/Manila` unless Antonio explicitly changes it.
- Keep IDs stable and descriptive.
- Put newest workout log entries first in source data when practical; the UI also sorts newest first.
- Use `sessionType: "Rest"` for missed check-ins, food-only logs, rest days, and non-training notes unless the entry is specifically `Recovery`, `Cardio`, or a completed training split.
- Leave `exercises: []` when no exercise details were reported.
- Use `notes` to record factual details, uncertainty, and missing fields.

## Logging Rules

Never invent data. This is the most important rule.

Allowed wording:

- "not reported"
- "not available"
- "unclear"
- "approximately"
- "reported as"
- "no exercise details logged"
- "not completed"

Do not infer:

- Zero activity from no activity report.
- Poor sleep from a missed sleep report.
- No pain from no pain report.
- Food intake from appetite comments alone.
- A completed workout from a planned session.
- A reason for a missed session unless Antonio reported it.

If a daily check-in was missed and no data was reported, add a minimal factual entry only:

> Daily fitness check-in was missed. No activity, training, sleep, pain or soreness, energy, body, or food data was reported.

If a planned workout was missed, explicitly say it was missed and not completed. Also say it is not stacked or doubled.

## Coaching Rules

The dashboard should support the active Fitness Coach guidance:

- Sleep under 6 hours, lightheadedness, meaningful pain, or unusual drowsiness closes the training gate.
- Missed workouts are not debt.
- Never stack or double missed sessions as punishment.
- Recovery days can be the correct decision.
- Completed attendance and compliant training volume are separate signals.
- Excess volume, failure work, or pain can keep progression on hold even when a session was completed.

Coach notes should lead with the practical decision and then list actions. Avoid motivational filler.

## Design Rules For Future Edits

Use `tokens.md` for colors, spacing, type, states, and breakpoints. Preserve the current visual language unless the user explicitly asks for a redesign.

Do:

- Keep the dashboard compact and scan-friendly.
- Use the deep green/lime identity sparingly for emphasis.
- Use the ink metric strip as one continuous block.
- Use 8px radii for cards, badges, buttons, and panels.
- Keep labels uppercase and small.
- Keep body copy factual and muted.
- Preserve the responsive behavior at 900px and 560px.

Do not:

- Add a marketing hero or landing-page sections.
- Add decorative gradients, blobs, or generic fitness imagery.
- Turn every row into a floating card.
- Increase border radii for a softer app look.
- Hide missing data by showing invented values.
- Convert the dashboard into an editing form unless explicitly requested.

## Update Workflow

For a normal log/dashboard update:

1. Read `app/data/mockDashboard.ts`, `app/types/dashboard.ts`, and the relevant component if display behavior might change.
2. Add only the factual data Antonio reported.
3. Update `weeklyReview`, `progressionGate`, and `messages` if the new data changes the coaching decision.
4. Keep `summary` consistent with the visible data.
5. Run the project validation command that is appropriate for the change.
6. If the change should be visible on the live site, publish through Sites.

For a design update:

1. Read `design.md`, `tokens.md`, and `app/globals.css`.
2. Change tokens first when the change is system-wide.
3. Change component-level CSS only when the scope is local.
4. Check both desktop and mobile breakpoints.
5. Update these docs if the design system changes.

## Acceptance Checklist

Before handing the site back:

- The dashboard still renders the main page as the first screen.
- No missing report has been converted into a fake value.
- Missed sessions are marked as missed and not completed.
- Training, rest, recovery, and food-only entries are not mixed together.
- Calendar status colors match the semantic day state.
- Priority badges and gate statuses still match their meanings.
- Mobile layout does not overlap text or hide primary data.
- `design.md` and `tokens.md` still describe the implementation.
