# Body Dashboard Design

This document describes the current Body Dashboard design as implemented in the site source. Use it as the visual and product reference before extending the dashboard.

## Product Role

Body Dashboard is a personal fitness control surface for Antonio. It is meant to make training status, recovery constraints, coach notes, and recent logs easy to scan. The tone is strict, practical, and recovery-aware. It should feel like a sober training dashboard, not a motivational landing page.

The site is read-only from the viewer's perspective. It renders structured dashboard data and does not invent analysis, logs, or coaching decisions in the UI.

## Visual Thesis

The design combines a quiet paper workspace with serious training signals:

- Pale paper background for a calm logbook feel.
- Dark ink panels for summary and target information.
- Deep green and lime accents for the Move Free identity.
- Warm orange and rose only for caution, dates, or high-priority signals.
- Compact 8px cards and table-like rows for repeated review.
- Serif display type for decisive headlines and numeric emphasis.
- Sans type for dashboard labels, notes, and controls.

Avoid making the dashboard louder or more decorative than the data. The design works because it is restrained and easy to scan.

## Page Structure

The root page is a single working surface:

1. Sticky topbar
   - Left: Move Free brand mark and wordmark.
   - Right: read-only dashboard status.

2. Hero
   - Current phase/week eyebrow.
   - Large serif headline.
   - Short coaching lede that explains the current training state.

3. Summary strip
   - Four dark metric cells: training, cardio, sleep, adherence.
   - Each metric has uppercase label, serif value, and small detail.

4. Week calendar
   - Monday-Sunday grid generated for the user's timezone.
   - Each day is selectable.
   - Selected day reveals the planned warm-up, main work, finisher when present, and guardrails.

5. Two-column dashboard body
   - Main column: coach notes, then workout log.
   - Side column: weekly summary, then body target card.

6. Footer
   - Small brand/system label and latest check-in date.

## Layout Rules

The content shell is capped at 1180px and inset from the viewport. Desktop uses a two-column body with a wider main column and narrower side column. The dashboard collapses to one column below 900px.

Cards use tight radii and clear borders. Do not nest cards inside cards. Full page sections should remain unframed or separated by rules; individual repeated items can use cards or rows.

The first viewport should show the real dashboard state, not a marketing introduction. Keep the hero concise so the metrics and calendar arrive quickly.

## Component Patterns

### Topbar

The topbar is sticky, 68px tall, translucent paper, and separated with a 1px rule. The brand mark is a 34px square in deep green with lime serif "M". Keep the mark compact and functional.

### Hero

The hero uses a very large Georgia headline with tight line-height. It should make the current training state feel decisive. The lede is muted, max-width 650px, and should explain the current coach stance in plain language.

### Summary Strip

The metrics strip is one dark rectangular block divided into four cells. Do not turn each metric into a separate floating card. Values use serif type to create hierarchy.

### Week Calendar

Calendar cards are real buttons. They show weekday, date, program, and a short detail. Status is communicated by the top border:

- `train`: green top border.
- `recover`: gray top border.
- `optional`: orange top border.
- `today`: dark card with lime program label.
- `selected`: dark border and elevated shadow.

The selected plan panel uses the same card language and divides content into warm-up, main plan, finisher, and guardrails.

### Coach Notes

Coach notes render as a list with strong horizontal rules rather than separate cards. Each note has a title, priority badge, message, and action chips. Priority classes:

- `high`: rose text on pale red.
- `medium`: brown-orange text on pale tan.
- `low`: green text on pale green.

The copy should remain direct and actionable.

### Weekly Summary And Gate Cards

The side-panel summary and progression gate use deep green blocks with lime labels. These are the strongest visual surfaces after the metrics strip. Keep them dense and readable.

Use the decorative outline square only on green emphasis panels. It should remain subtle and should not become a general background motif.

### Workout Log

The workout log is a timeline of expandable sessions. Newest sessions appear first. Each row contains:

- Date block.
- Duration or "Duration not reported".
- Session type.
- Notes or a fallback.
- Logged badge.
- Chevron state.

Exercise detail rows are grid-based on desktop and collapse on mobile. If sets, reps, load, or RIR are unavailable, the UI says so plainly.

## Responsive Behavior

At 900px and below:

- Summary metrics become two columns.
- Calendar becomes two columns.
- Dashboard body becomes one column.
- Exercise rows collapse from three columns to one.

At 560px and below:

- Shell inset tightens.
- Topbar status shortens to "Dashboard".
- Section metadata is hidden where it competes with content.
- Session rows remove the logged badge and small notes.
- Exercise details indent less.

Keep mobile dense but readable. Do not introduce huge vertical hero spacing or oversized cards on small screens.

## Copy Rules

Write copy like a coach's factual dashboard:

- Be specific about what happened.
- Separate completed training from missed sessions, recovery, rest, food logs, and activity-only days.
- Use direct safety language when sleep, pain, lightheadedness, or excessive volume changes the recommendation.
- Never frame a missed session as debt.
- Never tell the UI to "punish", stack, or double missed workouts.
- Do not invent sleep, pain, soreness, energy, exercises, food, steps, reasons, or ratings.

The dashboard may display uncertainty. Prefer "not reported", "unclear", or "not available" over a fabricated value.

## Implementation References (just refs pls)

Primary source files:

- `app/page.tsx`: page composition and main layout order.
- `app/globals.css`: visual system, layout, responsive rules.
- `app/components/SummaryStrip.tsx`: metrics strip.
- `app/components/WeekCalendar.tsx`: interactive weekly plan.
- `app/components/MessageFeed.tsx`: coach notes.
- `app/components/WorkoutLogView.tsx`: expandable workout timeline.
- `app/components/WeeklyReview.tsx`: side-panel review card.
- `app/components/ProgressionGate.tsx`: progression decision card.
- `app/data/mockDashboard.ts`: current static dashboard payload.
- `app/contracts/api-contract.md`: data and analysis contract.
