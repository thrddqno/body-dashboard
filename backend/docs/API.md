# HTTP API

Base URL in local development: `http://localhost:8080`. All endpoints consume/produce JSON unless no body is used. No endpoint requires authentication.

## Endpoint Index

| Method and path | Success | Function |
|---|---:|---|
| `POST /api/body-metrics` | `201` | Create one dated measurement; returns `Location` |
| `GET /api/body-metrics` | `200` | List all measurements, date descending |
| `GET /api/body-metrics/{id}` | `200` | Get one measurement |
| `GET /api/daily-logs/{date}` | `200` | Get one ISO-date daily log |
| `PUT /api/daily-logs/{date}` | `200` | Create or fully replace one daily log |
| `POST /api/workouts` | `201` | Create a workout aggregate; returns `Location` |
| `GET /api/workouts` | `200` | List all workouts with nested data, newest first |
| `GET /api/workouts/{id}` | `200` | Get one nested workout |
| `PATCH /api/workouts/{id}/status` | `200` | Replace only workout status |
| `GET /api/training-plans/{date}` | `200` | Get a persisted plan for an ISO date and optional workout type |
| `GET /api/dashboard` | `200` | Get current dashboard snapshot |
| `GET /api/analytics/weekly` | `200` | Get current calendar-week facts |
| `POST /api/ai-analysis/weekly` | `200` | Interpret structured facts or return insufficient-data output |

List endpoints are not paginated.

## Body Metrics

Create request:

```json
{"date":"2026-08-31","weightKg":80.2,"waistCm":84.0,"bodyFatPercentage":18.5}
```

| Field | Rule |
|---|---|
| `date` | Required; future dates allowed; unique |
| `weightKg` | Required; greater than zero; at most 4 integer and 2 fractional digits |
| `waistCm` | Optional; greater than zero; at most 4 integer and 2 fractional digits |
| `bodyFatPercentage` | Optional; greater than zero and at most 100; at most 3 integer and 2 fractional digits |

Response adds `id` and `createdAt`. Duplicate dates return `400`. Missing IDs return `404`.

## Daily Logs

PUT request fields are all optional:

```json
{
  "sleepMinutes":450,
  "steps":9000,
  "energy":"HIGH",
  "painNotes":null,
  "recoveryNotes":"Recovered well",
  "estimatedCalories":2400,
  "estimatedProteinGrams":160
}
```

- Numeric fields must be nonnegative when present.
- `energy`: `VERY_LOW`, `LOW`, `AVERAGE`, `HIGH`, or `VERY_HIGH`.
- PUT is a full replacement/upsert. Omitted and explicit `null` fields clear old values.
- The path supplies the date. Creation and update both return `200`.
- Response adds `id`, path `date`, `createdAt`, and `updatedAt`.

## Workouts

Create request:

```json
{
  "date":"2026-08-31",
  "workoutType":"Upper",
  "status":"COMPLETED",
  "notes":"Optional",
  "exercises":[{
    "exerciseName":"Bench press",
    "orderIndex":1,
    "sets":[{"setNumber":1,"weightKg":80,"reps":8,"rir":2,"warmup":false}]
  }]
}
```

| Field | Rule |
|---|---|
| `date`, `status` | Required; status is `PLANNED`, `COMPLETED`, or `MISSED` |
| `workoutType` | Required, nonblank, at most 100 characters |
| `notes` | Optional |
| `exercises` | Optional/null means empty; nested values are validated; null elements are rejected |
| `exerciseName` | Nonblank; at most 255 characters |
| `orderIndex`, `setNumber`, `reps` | Positive integer |
| `sets` | Optional/null means empty; null elements are rejected |
| `weightKg` | Required and nonnegative; at most 5 integer and 2 fractional digits |
| `rir` | Optional integer from 0 through 10 |
| `warmup` | Optional; defaults to `false` |

Responses add IDs/timestamps, sort exercises by `orderIndex`, and sort sets by `setNumber`. Duplicate order/set numbers are accepted. Status PATCH body is `{"status":"MISSED"}`; every transition is allowed and all other data is preserved.

## Dashboard Response

`GET /api/dashboard` returns:

- `today`: server-clock date and that date's daily log or `null`.
- `body`: latest weight plus at most 30 recent metrics.
- `training`: latest workout regardless of status plus current Monday-Sunday completed/missed counts. `PLANNED` is excluded.

## Weekly Analytics Response

`GET /api/analytics/weekly` returns `period`, `body`, `recovery`, and `training`. See [ANALYTICS_AND_AI.md](ANALYTICS_AND_AI.md) for formulas and boundaries.

## Weekly AI Response

`POST /api/ai-analysis/weekly` requires `Content-Type: application/json` and an empty JSON object (`{}`). Requiring JSON prevents cross-origin browser pages from invoking this state-changing operation as a simple request. It returns:

```json
{
  "summary":"...",
  "knownFacts":[],
  "interpretation":[],
  "strengths":[],
  "concerns":[],
  "recommendations":[],
  "dataGaps":[]
}
```

Insufficient data returns a deterministic `200` response without provider use. Provider transport, serialization, or empty-response failure returns `503`.

## Error Contract

Handled errors have this shape:

```json
{
  "timestamp":"2026-08-31T12:00:00",
  "status":400,
  "error":"Bad Request",
  "message":"Request validation failed",
  "fieldErrors":{"weightKg":"Weight must be greater than zero"}
}
```

| Cause | Status |
|---|---:|
| Bean validation, malformed JSON/path/date/enum, duplicate body date | `400` |
| Missing body metric, daily log, or workout | `404` |
| AI provider failure | `503` |
| Unrecognized persistence integrity failure | `500` |

The application uses `ApiError` for the cases above. Unrecognized persistence failures use a sanitized message and do not expose SQL details. Spring still handles unlisted failures such as unsupported methods and media types, so those response bodies may differ.
## Training Plans

### `GET /api/training-plans/{date}`

Returns the persisted recurring plan for an ISO `yyyy-MM-dd` date. By default, the date's weekday selects the template. An optional `workoutType` query parameter selects the complete persisted template for a planned override, for example `GET /api/training-plans/2026-09-01?workoutType=UPPER`.

The response includes the requested date and weekday, canonical workout type, display content, exercises, warm-up, guardrails, and optional recovery activities. Workout-type matching is case-insensitive. Invalid dates return `400`; an unconfigured weekday or workout type returns `404`.
