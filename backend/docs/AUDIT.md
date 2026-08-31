# Backend Audit

Audit scope: implementation, schema, configuration, and tests under `backend/`. This is a risk register, not a claim that every item is currently user-visible. Update status when fixes land.

## High Priority

| Finding | Status | Impact / direction |
|---|---|---|
| No authentication/authorization | Accepted for current scope | Add only before exposure beyond a trusted local environment |
| Remote AI receives pain/recovery/workout notes | Open | Add explicit privacy controls/redaction and document provider retention |
| Tests use H2 only | Implemented; PostgreSQL run pending | A Docker-gated Testcontainers suite now covers startup, Flyway, JPA validation, constraints, precision, persistence, and the DailyLog race. It must pass in a Docker-capable environment before this is marked resolved. |
| OpenAI-compatible adapter has no direct tests | Resolved | Loopback HTTP tests cover request, authentication, payload, response, timeout, transport, and provider error behavior. |
| Unbounded list endpoints and all-workout analytics load | Open; recommended next issue | Add pagination and repository-level period/projection queries. |

## Correctness And Contract

| Finding | Status / current behavior |
|---|---|
| Daily PUT is easy to mistake for PATCH | Unchanged by design; omitted fields clear existing values and creation still returns `200` |
| DTO/schema limits differ | Resolved for current request DTOs; length and numeric precision/scale limits now fail validation with `400` |
| Body persistence errors are overclassified | Resolved; only the named body-date unique constraint is translated as a duplicate |
| Concurrent daily first-upserts can race | Implemented; a named date-constraint conflict is retried after rollback. PostgreSQL concurrency verification is pending a Docker-capable run. |
| Nested lists permit null elements | Resolved; null exercise/set elements fail Bean Validation with `400` |
| Duplicate exercise/set order numbers allowed | Open; relative response order for equal numbers is unspecified |
| Workout transitions unrestricted | Open; any status can transition to any status |
| Future dates accepted | Open; future records can influence current-week and recent AI/dashboard context |
| Latest-workout tie-break differs | Open; list uses creation time while dashboard uses ID for same-date records |
| Selected errors only use `ApiError` | Partially resolved; malformed bodies/enums/path values, validation, domain errors, and persistence integrity failures are covered. Other framework errors may still differ. |

## Analytics Semantics To Confirm

| Finding | Current behavior |
|---|---|
| Adherence wording vs formula | Formula excludes `PLANNED`, while an AI gap says no planned data exists |
| Warm-up treatment | Warm-up sets count toward volume and every PR |
| Exercise identity | Names are exact and case-sensitive; variants create separate PR groups |
| Duplicate exercise instances | Highest exercise volume evaluates each instance, not their per-workout sum |
| Exact body comparison dates | 7/30-day changes disappear if the exact date is missing |
| Week extends into future | On Monday-Saturday, current week ends on upcoming Sunday |
| AI sufficiency is broad | Historical/latest records can trigger provider use with sparse current-week data |
| Recent AI queries are not capped at today | Future-dated logs/workouts can be included |

## Architecture And Operations

| Finding | Consequence |
|---|---|
| External AI call occurs in a read-only transaction | Database transaction resources may remain open for provider timeout duration |
| Local timestamp sources differ | Entities use `LocalDateTime.now`; analytics use injected default-zone `Clock` |
| No optimistic locking | Concurrent updates are last-write-wins except unique constraints |
| PostgreSQL context/startup test awaiting execution | The Testcontainers test is implemented but must run successfully in a Docker-capable environment before startup coverage is considered verified |
| No health endpoints/deployment artifact | Production orchestration has no native readiness signal or supplied container |
| MapStruct/Lombok configured but unused | Build complexity without current implementation benefit |
| Dashboard-specific AI path is unreachable | Service/model/provider method exist but no HTTP endpoint uses them |

## Notable Test Gaps

- API boundaries: same-date ordering and unsupported methods/media types remain; malformed path dates, empty daily PUT, nested nulls, and current field constraints are covered.
- Database behavior: optimistic locking/concurrency semantics remain open. PostgreSQL migrations, constraints, precision, persistence, and concurrent first-upserts have a Docker-gated suite whose first successful run is pending.
- Analytics: rounding boundaries, complete moving-average series, time-zone/year boundaries, PR ties, warm-up policy, and name normalization.
- AI/configuration: provider bean selection, unavailable/partial provider results, future-record filtering, and sensitive-field handling remain; the adapter HTTP contract is covered.
- Delivery: executable JAR startup and a real HTTP smoke test against PostgreSQL.

## Existing Strengths

- Controllers are thin; deterministic calculations live in testable services.
- Public responses use DTOs rather than JPA entities.
- Flyway owns schema and Hibernate validates it.
- Database checks mirror most API validation.
- AI is behind application-owned interfaces, disabled by default, and cannot overwrite facts.
- Empty analytics use explicit null/zero/empty semantics, and calendar tests use fixed clocks.
