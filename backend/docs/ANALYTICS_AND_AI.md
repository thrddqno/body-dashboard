# Analytics And AI

Deterministic Java code calculates facts. AI receives structured facts and may interpret them; it is not a calculator or source of truth.

## Time Windows

| Function | Window |
|---|---|
| Dashboard workout counts | Current Monday through Sunday, inclusive |
| Weekly analytics | Current Monday through Sunday, inclusive |
| AI recovery facts | Trailing 7 days ending today, inclusive |
| AI recent context | 7 newest daily logs and 5 newest workouts |

The injected clock uses the JVM default zone. Future-dated records are accepted and can enter current-week or recent-record results.

## Body Calculations

- Weekly latest weight: chronologically last measurement in the week.
- Weekly weight change: `last weekly weight - first weekly weight`; absent with fewer than two measurements.
- AI latest weight: latest measurement across all dates.
- AI 7/30-day change: `latest - value on exact latestDate - N days`; no nearest-date substitution.
- Seven-day moving average: each measurement's average over available measurements in `[date-6, date]`, rounded to 2 decimals. It exists internally but is not in the public weekly response.

## Recovery Calculations

- Sleep and steps independently ignore null values; missing values are not zero.
- Average sleep minutes is rounded to 2 decimals. Public weekly output converts it to hours and rounds to 1 decimal.
- Average steps rounds half-up to a whole integer.
- Energy analytics count days with a non-null energy report; no score is calculated.

## Workout Calculations

```text
set volume       = weightKg * reps
workout volume   = sum(all set volumes)
adherence        = completed * 100 / (completed + missed)
```

- `PLANNED` workouts are excluded from adherence. No completed/missed outcomes means `null` adherence.
- Only completed workouts appear in weekly volume and all-time personal records.
- Warm-up sets are included in volume and PRs.
- Exercise names group by exact case-sensitive text.
- PR facts include highest weight (reps break ties), best reps at each weight, and highest single exercise-instance volume.
- Weekly public analytics expose only counts/adherence; volume and PR facts feed AI context.

## Weekly AI Flow

```text
PostgreSQL
  -> deterministic analytics
  -> AnalysisContext + explicit data gaps
  -> sufficiency check
  -> AiProvider
  -> WeeklyAiAnalysisResponse
```

`AnalysisContextBuilder` includes:

- Current-week boundary and all-time latest body facts.
- Trailing-seven-day sleep, steps, and energy coverage.
- Current-week outcomes/volume and all-time PRs.
- Seven recent daily logs: sleep, steps, energy, pain and recovery notes.
- Five recent workouts: date, type, status, and notes.
- Human-readable missing-data statements.

If no weight, recovery average, workout outcome, recent daily log, or recent workout exists, `WeeklyAiAnalysisService` returns deterministic insufficient-data output without calling a provider.

## Providers

| Provider setting | Behavior |
|---|---|
| `none` (default) | In-process no-op result; no external request |
| `openai-compatible` | Bearer-authenticated `POST {baseUrl}/chat/completions` |

OpenAI-compatible requests use the configured model, temperature `0.2`, and JSON-serialized context. The prompt forbids invented data and recalculation. Raw provider text currently becomes both `summary` and the sole `interpretation`; structured strengths/concerns/recommendations are not parsed from model output.

## Data And Failure Boundaries

- Enabling a remote provider sends fitness facts and free-text pain, recovery, and workout notes outside the application.
- API keys are configuration only and must never be committed.
- Provider base URL must be absolute HTTPS; model/key are required and timeout must be positive.
- Transport/serialization/empty-response errors become a sanitized `503` message.
- Weekly AI output is persisted separately for later display and cannot modify factual records. No automatic retention policy is currently configured.

`DashboardAiInterpretationService` and its dashboard-specific context/DTO/provider method exist and are tested, but no controller exposes that path. The active HTTP AI feature is weekly analysis.
