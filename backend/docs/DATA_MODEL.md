# Data Model And Persistence

PostgreSQL is the source of truth. Flyway migrations are append-only; Hibernate validates but does not create/update schema.

## Tables

| Table | Purpose | Key rules |
|---|---|---|
| `body_metrics` | Dated body measurements | One row/date; weight required and positive; optional waist/body fat constrained positive |
| `daily_logs` | Dated recovery/activity journal | One row/date; optional numeric values nonnegative; energy enum constrained |
| `workouts` | Workout header | Multiple/date; required type/status; optional notes |
| `workout_exercises` | Ordered workout exercise | FK to workout; positive `order_index` |
| `exercise_sets` | Ordered exercise set | FK to exercise; nonnegative weight, positive reps, RIR 0-10 |
| `weekly_ai_analyses` | Saved weekly AI interpretations | Generated timestamp plus JSON analysis payload |

Migrations: `V1__create_body_metrics.sql`, `V2__create_daily_logs.sql`, `V3__create_workouts.sql`, `V4__create_weekly_ai_analyses.sql`. No seed data exists.

## Entity Shape

### BodyMetric

`id`, `date`, `weightKg`, `waistCm`, `bodyFatPercentage`, `createdAt`.

- Date uniqueness is checked by the service and database.
- `createdAt` is assigned by JPA using application-host local time; the SQL default is normally overwritten.

### DailyLog

`id`, `date`, `sleepMinutes`, `steps`, `energy`, `painNotes`, `recoveryNotes`, `estimatedCalories`, `estimatedProteinGrams`, `createdAt`, `updatedAt`.

- PUT loads by date or creates an entity, then assigns every mutable field.
- A concurrent first-insert unique conflict is retried once in a fresh transaction after the failed transaction rolls back.
- JPA callbacks assign local timestamps; direct SQL does not maintain `updatedAt`.

### Workout Aggregate

```text
Workout 1 -> many WorkoutExercise 1 -> many ExerciseSet
```

- `Workout`: `id`, `date`, `workoutType`, `status`, `notes`, timestamps, exercises.
- `WorkoutExercise`: `id`, parent, `exerciseName`, `orderIndex`, sets.
- `ExerciseSet`: `id`, parent, `setNumber`, `weightKg`, `reps`, optional `rir`, `warmup`.
- Parent collections use cascade-all and orphan removal; database FKs also cascade deletes.
- No child repositories exist. Save the aggregate through `WorkoutRepository`.
- Relationships are lazy. Services map them to DTOs inside transactions because Open EntityManager in View is off.
- No optimistic-lock `@Version` fields exist; normal concurrent writes are last-write-wins.

## Repository Queries

| Repository | Important behavior |
|---|---|
| `BodyMetricRepository` | Date existence/lookup, date-desc list, inclusive date range, top 30 |
| `DailyLogRepository` | Unique date lookup, inclusive range, paged date-desc recent logs |
| `WorkoutRepository` | Full newest-first list, inclusive week counts, latest summary, paged recent workouts |

Workout list order is `date DESC, createdAt DESC`; dashboard latest-workout order is `date DESC, id DESC`.

## Transaction Boundaries

- Mutating persistence operations are transactional. DailyLog upsert orchestration sits outside the transaction so a named unique-date conflict can retry in a fresh transaction.
- Read and mapping methods use read-only transactions.
- Workout status update relies on JPA dirty checking rather than an explicit save.
- AI context construction is read-only but provider invocation by the weekly AI service remains inside its read-only transaction.

## Schema Change Checklist

1. Add a new numbered Flyway migration; never rewrite an applied migration.
2. Update entity mappings and database constraints together.
3. Update request validation so invalid values fail before persistence.
4. Map through DTOs; never return an entity.
5. Test migrations and behavior. Prefer PostgreSQL coverage for database-specific changes.
