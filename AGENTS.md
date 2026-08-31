# AGENTS.md

## Project

Body Dashboard is a personal fitness tracking and analysis application.

The project should evolve from a simple dashboard into a real application with:

- workout logging
- body metrics
- daily recovery/activity logs
- deterministic fitness analytics
- AI-assisted analysis and coaching

The application must keep factual calculations separate from AI interpretation.

---

## Architecture

This repository is a monorepo.

```text
body-dashboard/
├── frontend/
├── backend/
├── docker-compose.yml
├── README.md
└── AGENTS.md
```

### Frontend

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts when charts are needed

Prefer feature-based organization.

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

Do not put business rules in React components.

The frontend should primarily:

- collect user input
- call backend APIs
- display data
- handle local presentation state

#### Design Reference

The canonical visual design is documented under:

`docs/design/`

Before substantially changing dashboard UI:

1. read `docs/design/DESIGN.md`
2. inspect the reference screenshots
3. reuse the defined design tokens
4. preserve the existing visual hierarchy unless explicitly requested otherwise

Do not independently redesign existing components.

---

### Backend

Use:

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- PostgreSQL
- Flyway
- Jakarta Validation
- Lombok
- MapStruct when mapping becomes non-trivial
- Maven

Package root:

```text
com.antonio.bodydashboard
```

Preferred organization:

```text
backend/src/main/java/com/antonio/bodydashboard/
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── mapper/
├── config/
└── exception/
```

Keep controllers thin.

Business logic belongs in services.

Repositories should focus on persistence.

Do not expose JPA entities directly through public API responses.

---

## Database

PostgreSQL is the source of truth.

Use Flyway for all schema changes.

Never rely on Hibernate to mutate the production schema.

Use:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

Create migrations using:

```text
V1__description.sql
V2__description.sql
V3__description.sql
```

Do not modify an already-applied migration unless explicitly instructed.

Create a new migration instead.

---

## Development Approach

Use vertical slices.

Do not attempt to implement the entire application at once.

A feature should ideally be completed through:

```text
database
↓
entity/repository
↓
service
↓
DTO/API
↓
frontend
↓
tests
```

Prefer small, reviewable changes over broad refactors.

Do not modify unrelated code unless required.

If unrelated cleanup is discovered, mention it separately instead of silently including it.

---

## Initial Feature Order

Unless explicitly instructed otherwise, prioritize:

1. project infrastructure
2. body metrics
3. frontend body metric display
4. workout logging
5. daily logs
6. dashboard aggregation
7. deterministic analytics
8. AI analysis
9. authentication only if it becomes necessary

Do not prematurely implement later stages.

---

## Core Domain

Expected initial concepts include:

### BodyMetric

Examples:

- date
- weightKg
- waistCm
- bodyFatPercentage
- createdAt

### Workout

Examples:

- date
- workoutType
- status
- notes
- exercises

### WorkoutExercise

Examples:

- exerciseName
- orderIndex
- sets

### ExerciseSet

Examples:

- setNumber
- weightKg
- reps
- rir
- warmup

### DailyLog

Examples:

- date
- sleepMinutes
- steps
- energy
- painNotes
- recoveryNotes
- estimatedCalories
- estimatedProteinGrams

Exact schemas may evolve. Do not over-model prematurely.

---

## API Design

Use REST unless there is a strong reason otherwise.

Prefer predictable endpoints such as:

```text
GET  /api/body-metrics
POST /api/body-metrics

GET  /api/workouts
GET  /api/workouts/{id}
POST /api/workouts

GET /api/daily-logs/{date}
PUT /api/daily-logs/{date}

GET /api/dashboard
```

Use appropriate HTTP status codes.

Validate incoming DTOs.

Return useful error responses.

Do not leak stack traces or database details through API responses.

---

## Dashboard

The frontend should not independently reconstruct all dashboard statistics.

Prefer a backend aggregation endpoint:

```text
GET /api/dashboard
```

The backend should calculate and return the relevant data snapshot.

Presentation formatting still belongs in the frontend.

---

## Analytics

Deterministic calculations belong in Java.

Examples:

- workout volume
- personal records
- weight change
- moving averages
- workout adherence
- sleep averages
- step averages
- progression detection
- calorie averages
- trend calculations

Do not use an LLM to calculate values that can be reliably calculated in code.

Analytics logic should be testable without an AI provider.

---

## AI Analysis

AI is an interpretation layer, not the source of truth.

Expected flow:

```text
PostgreSQL
↓
deterministic analytics
↓
structured analysis context
↓
LLM
↓
human-readable analysis
```

The AI may:

- explain trends
- identify relevant patterns
- prioritize issues
- summarize recovery
- discuss training progression
- generate coaching-style observations

The AI must not silently invent missing measurements or workout data.

Keep AI-provider integration isolated behind a dedicated service/interface.

Do not couple domain services directly to a specific LLM vendor.

Never commit API keys or secrets.

### AI Provider Integration

Do not add an AI provider during early infrastructure, body metrics, workout logging, daily logs, dashboard, or deterministic analytics work.

When the AI analysis vertical slice begins:

- define an application-owned AI service/interface first
- pass only structured deterministic analytics context to the AI layer
- keep provider-specific SDKs and prompts behind an adapter/service
- load model names, URLs, and API keys from environment/configuration only
- provide safe behavior when no provider is configured
- test deterministic analytics without requiring an AI provider
- never let AI responses overwrite factual records or calculated metrics

A useful optional agent skill for that later slice is:

```bash
npx skills add giuseppe-trisciuoglio/developer-kit@langchain4j-spring-boot-integration -g -y
```

Use it only when implementing Java/Spring AI-provider integration, not before.

---

## Code Quality

Prefer boring, readable code over clever abstractions.

Avoid:

- unnecessary design patterns
- speculative generic abstractions
- premature microservices
- unnecessary interfaces with only one implementation
- excessive DTO proliferation
- giant service classes
- giant React components
- hidden side effects

Only introduce abstraction when there is an actual reason for it.

Use descriptive names.

Keep methods focused.

Prefer explicit behavior over magic.

---

## Authentication and Deployment

This application is currently intended for single-user use in a trusted local environment.

Do not add authentication or authorization unless explicitly requested.

If the application is later exposed beyond localhost or a trusted private network,
reassess authentication, authorization, TLS, CORS, secret management, and network access controls before deployment.

## Testing

Backend changes should include tests when meaningful.

Prioritize tests for:

- business logic
- analytics
- validation
- edge cases

Use:

- JUnit
- Spring Boot Test where appropriate
- Mockito only where mocking provides value

Do not mock simple value objects unnecessarily.

For frontend code, test business-critical behavior when appropriate.

Do not add large testing frameworks without a clear need.

---

## Commands

Before considering backend work complete, run:

```bash
cd backend
./mvnw test
```

When relevant, also run:

```bash
./mvnw spring-boot:run
```

For frontend work:

```bash
cd frontend
npm install
npm run build
```

Run lint/type-check commands when configured.

If a command fails, investigate the failure rather than ignoring it.

---

## Git

Keep changes small and logically grouped.

Suggested commit style:

```text
chore: scaffold spring boot backend
chore: add postgres development environment
feat: add body metrics API
feat: display latest body metric
feat: add workout logging
fix: validate duplicate daily logs
refactor: extract workout analytics service
```

Do not commit generated build artifacts.

Never rewrite existing Git history unless explicitly requested.

---

## Agent Workflow

Before implementing a non-trivial task:

1. inspect the relevant code
2. understand the existing architecture
3. identify the smallest viable change
4. implement only that scope
5. run relevant tests/build commands
6. review the resulting diff

When operating in plan mode, do not modify files.

When implementing, follow the approved plan unless new evidence requires changing it.

If the plan becomes invalid, explain why before substantially changing direction.

---

## When Finishing a Task

Report:

1. what changed
2. important architectural decisions
3. tests or commands run
4. any failures or limitations
5. reasonable next step

Do not claim tests passed unless they were actually run.

Do not claim a feature works unless its relevant path was verified.

---

## Important Constraints

Do not:

- add authentication prematurely
- introduce microservices
- use AI for deterministic calculations
- store fitness records only in frontend state
- expose database entities directly
- use `ddl-auto: update`
- commit secrets
- redesign unrelated parts of the application
- generate thousands of lines for a small ticket
- silently invent user fitness data

When uncertain, prefer the simpler architecture and a smaller change.
