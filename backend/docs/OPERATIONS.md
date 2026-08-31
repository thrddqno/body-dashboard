# Operations And Testing

## Local Run

Requirements: Java 21, Docker, Docker Compose.

From repository root:

```bash
docker compose up -d postgres
cd backend
./mvnw spring-boot:run
```

This command starts PostgreSQL 16 Alpine on loopback host port `5433`. Startup applies Flyway migrations, validates JPA mappings, and the locally run backend listens on `8080` by default.

## Containerized Run

From repository root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on loopback host port `5433`
- backend on loopback host port `8080`

Inside Docker Compose, the backend uses `jdbc:postgresql://postgres:5432/body_dashboard`.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/body_dashboard` | JDBC URL |
| `DB_USERNAME` | `body_dashboard` | Database user |
| `DB_PASSWORD` | `body_dashboard` | Database password |
| `SERVER_PORT` | `8080` | HTTP port |
| `AI_INTERPRETATION_PROVIDER` | `none` | `none` or `openai-compatible` |
| `AI_INTERPRETATION_MODEL` | empty | Remote model; required in AI mode |
| `AI_INTERPRETATION_BASE_URL` | `https://api.openai.com/v1` | HTTPS API root |
| `AI_INTERPRETATION_API_KEY` | empty | Bearer token; required in AI mode |
| `AI_INTERPRETATION_TIMEOUT` | `30s` | Connect/read timeout; must be positive |

Spring Boot does not load a root `.env` file directly. Docker Compose loads the root `.env` file for variable interpolation; copy `.env.example` to `.env` and provide a rotated API key there. For direct backend execution, supply variables through the shell or process manager. Never store provider keys in tracked Compose files.

## Build And Test

```bash
cd backend
./mvnw test
./mvnw package
./mvnw -Ppostgres-integration verify
```

- Tests use profile `test`, H2 in PostgreSQL compatibility mode, production Flyway migrations, and `ddl-auto: validate`.
- Controller tests use Spring Boot, MockMvc, repositories, and H2.
- Analytics and AI components also have focused unit tests.
- OpenAI-compatible HTTP contract tests use a loopback stub server and never call an external provider.
- The `postgres-integration` profile requires access to a running Docker daemon. It starts PostgreSQL 16 with Testcontainers and runs the `*IT` Failsafe suite.
- PostgreSQL integration tests use production Flyway and JPA settings rather than the H2 `test` profile.
- Fixed clocks make calendar-dependent tests deterministic.
- There is no lint/static-analysis or coverage threshold.

## Test Coverage Map

| Suite area | Covered behavior |
|---|---|
| Body metrics | Create/validation/duplicate, list order, get/not-found |
| Daily logs | Create/full-replacement upsert, race retry, negative validation, get/not-found |
| Workouts | Nested create, null-element/constraint validation, sorting, get/list, status update preservation |
| Dashboard | Complete/empty sections and week-boundary counts |
| Analytics | Body changes/moving average, recovery averages, adherence, volume, PRs |
| AI | Property validation, no-op/delegation, context, success/insufficient/failure API, local-stub adapter contract |
| PostgreSQL profile | Container/context startup, Flyway, JPA validation, constraints, numeric definitions, aggregate persistence, concurrent daily upserts |

See [AUDIT.md](AUDIT.md) for important missing coverage.

## Runtime Characteristics

- No actuator health/readiness endpoints.
- No scheduled jobs, queues, caches, or background processing.
- No authentication/authorization or custom CORS policy.
- The backend Docker image uses a non-root runtime user; Compose is intended for trusted local development only.
- No pagination for body metrics/workouts.
- Logs and observability use Spring defaults; no application-specific metrics/tracing is configured.

## Troubleshooting Order

1. Verify Java 21: `java -version`.
2. Verify PostgreSQL is healthy: `docker compose ps`.
3. Check `DB_*` values and host port `5433`.
4. Read Flyway/Hibernate startup errors; do not switch to `ddl-auto: update`.
5. For AI startup failures, verify provider name, HTTPS URL, model, key, and timeout.
6. Reproduce with `./mvnw test` before changing implementation.
