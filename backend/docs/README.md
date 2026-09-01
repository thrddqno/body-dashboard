# Backend Handbook

Compact, implementation-derived documentation for `backend/`. Update it when behavior changes.

## Read By Task

| Need | Document |
|---|---|
| Understand layers and feature ownership | This file |
| Call or change an endpoint | [API.md](API.md) |
| Change entities, repositories, or migrations | [DATA_MODEL.md](DATA_MODEL.md) |
| Change calculations or AI behavior | [ANALYTICS_AND_AI.md](ANALYTICS_AND_AI.md) |
| Run, configure, build, or test | [OPERATIONS.md](OPERATIONS.md) |
| Review known risks and gaps | [AUDIT.md](AUDIT.md) |

## Purpose And Stack

The backend stores personal fitness records, exposes REST APIs, computes deterministic dashboard/analytics facts, and optionally asks an external AI provider to interpret those facts.

- Java 21, Spring Boot 4.1.1, Maven Wrapper
- Spring MVC, Jakarta Validation, Spring Data JPA
- PostgreSQL 16 and Flyway; H2 only in tests
- Package root: `com.antonio.bodydashboard`
- Process entry: `BodyDashboardApplication`

## Request Flow

```text
REST/MCP -> adapter -> request validation -> service -> repository -> PostgreSQL
                                                   |
                                                   +-> response DTO -> JSON
```

Controllers define HTTP semantics. Services own mapping, transactions, business rules, aggregation, and calculations. Repositories own queries. Entities are persistence-only and are never public API responses. `GlobalExceptionHandler` translates selected failures into `ApiError`.

## Feature Map

| Feature | Entry point | Core service | Storage/dependencies |
|---|---|---|---|
| Body measurements | `BodyMetricController` | `BodyMetricService` | `BodyMetricRepository`, `body_metrics` |
| Daily recovery/activity | `DailyLogController` | `DailyLogService` | `DailyLogRepository`, `daily_logs` |
| Workout logging | `WorkoutController` | `WorkoutService` | `WorkoutRepository`, workout aggregate tables |
| Dashboard snapshot | `DashboardController` | `DashboardService` | All three repositories |
| Weekly facts | `AnalyticsController` | `WeeklyAnalyticsService` | Body/recovery/workout analytics services |
| Weekly AI coaching | `AiAnalysisController` | `WeeklyAiAnalysisService` | Context builder plus configured AI provider |
| Recurring training plans | `TrainingPlanController` | `TrainingPlanService` | `TrainingPlanRepository`, `training_plans` |
| MCP read tools | `mcp` package | Existing workout, plan, analytics, and analysis services | Spring AI Streamable HTTP adapter |

## Package Map

| Package | Responsibility |
|---|---|
| `controller` | Six REST controllers; thin delegation and status/header handling |
| `dto` | Validated request records and JSON response records |
| `service` | CRUD, dashboard aggregation, weekly response assembly |
| `service.analytics` | Deterministic body, recovery, volume, adherence, and PR calculations |
| `service.ai` | Structured context, provider boundary, no-op and OpenAI-compatible adapters |
| `entity` | JPA model and `EnergyLevel`/`WorkoutStatus` enums |
| `repository` | Three Spring Data repositories; children persist through `Workout` |
| `config` | Application clock and AI provider/property wiring |
| `exception` | Domain exceptions and selected HTTP error mappings |
| `mcp` | Conditional read-only MCP tool adapters and input validation |

## Global Conventions

- Dates are ISO `yyyy-MM-dd`; timestamps are offset-free `LocalDateTime` except AI generation instants.
- Calendar behavior uses the JVM default time zone through an injected `Clock` where implemented.
- Lists use newest-first ordering unless a response says otherwise.
- Missing analytics values serialize as `null`; counts and collections use zero/empty values.
- There is no authentication, authorization, custom CORS, actuator, scheduler, or background worker. MCP is disabled by default and must remain local/private.
- Flyway owns schema changes. Hibernate uses `ddl-auto: validate` and Open EntityManager in View is disabled.

## Change Guide

| Change | Minimum files to inspect |
|---|---|
| Request/response field | DTO, controller test, service mapper, frontend consumer |
| Business rule | Service plus focused unit/integration tests |
| Persisted field/constraint | New Flyway migration, entity, DTO/service, tests |
| Calculation | Analytics service and deterministic unit tests |
| AI context | Deterministic source, `AnalysisContext`, builder, provider/privacy impact |
| Error contract | Exception handler and controller tests |

Do not put calculations in controllers or AI prompts, expose entities, mutate schema through Hibernate, or let AI output overwrite factual data.
