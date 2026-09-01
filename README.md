# Body Dashboard

Personal fitness tracking and analysis application.

## Frontend

The frontend is a React, TypeScript, Vite, and Tailwind CSS project in `frontend/`.

### Install dependencies

```bash
cd frontend
npm install
```

### Run the frontend

```bash
cd frontend
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8080`. Use `VITE_API_BASE_URL` only when a different API base URL is required; do not place secrets in frontend environment variables.

### Build and lint

```bash
cd frontend
npm run build
npm run lint
```

## Backend

The backend is a Java 21 Spring Boot Maven project in `backend/`.

### Requirements

- Java 21
- Docker and Docker Compose for the local PostgreSQL database

### Start local PostgreSQL

```bash
docker compose up -d postgres
```

Default local development settings:

- Database: `body_dashboard`
- Username: `body_dashboard`
- Password: `body_dashboard`
- Host port: `5433`

The Spring Boot app can also be configured with environment variables:

```bash
DB_URL=jdbc:postgresql://localhost:5433/body_dashboard
DB_USERNAME=body_dashboard
DB_PASSWORD=body_dashboard
SERVER_PORT=8080
SERVER_ADDRESS=127.0.0.1
```

### Run tests

```bash
cd backend
./mvnw test
```

### Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

### Run backend and PostgreSQL with Docker Compose

```bash
docker compose up --build
```

This starts PostgreSQL and the Spring Boot backend on `http://localhost:8080`.

Flyway is enabled and Hibernate is configured with `ddl-auto: validate`. Add schema changes under `backend/src/main/resources/db/migration/` as versioned migrations.

### Optional AI dashboard interpretation

AI interpretation is disabled by default. Deterministic dashboard calculations must be produced by backend application code first; the AI layer may only explain the structured facts it receives.

Default behavior:

```bash
AI_INTERPRETATION_PROVIDER=none
```

To enable an OpenAI-compatible provider, configure environment variables at runtime:

```bash
AI_INTERPRETATION_PROVIDER=openai-compatible
AI_INTERPRETATION_BASE_URL=https://api.openai.com/v1
AI_INTERPRETATION_MODEL=<model-name>
AI_INTERPRETATION_API_KEY=<secret>
AI_INTERPRETATION_TIMEOUT=30s
```

Never commit provider API keys or secrets. Remote AI provider URLs must use HTTPS.

## MCP Integration

The backend can expose read-only workout capabilities through the Model Context Protocol (MCP). MCP is an additional adapter over the same services used by REST; it does not access repositories directly and does not change existing REST endpoints.

The integration uses Spring AI 2.0.1 with synchronous Streamable HTTP over Spring MVC. It is disabled by default and listens at `http://127.0.0.1:8080/mcp` when enabled.

### Enable MCP

Start PostgreSQL, then run the backend with MCP enabled:

```bash
docker compose up -d postgres
cd backend
MCP_ENABLED=true ./mvnw spring-boot:run
```

For the full Docker Compose stack:

```bash
MCP_ENABLED=true docker compose up --build
```

Docker publishes the backend only on host loopback at `127.0.0.1:8080`. `SERVER_ADDRESS` defaults to `127.0.0.1` outside Docker.

### Available Tools

| Tool | Parameters | Result |
|---|---|---|
| `get_workouts` | `from`, `to` as `YYYY-MM-DD` | Workouts in an inclusive range of at most 366 days |
| `get_workout_by_date` | `date` as `YYYY-MM-DD` | All workouts for the date and a `found` flag |
| `get_weekly_workout_summary` | Monday `weekStart` as `YYYY-MM-DD` | Deterministic completed/missed counts, adherence, volume, and personal records |
| `get_training_plan` | `date` as `YYYY-MM-DD` | Persisted recurring plan for the date |
| `get_latest_analysis` | None | Latest stored weekly AI analysis, without generating one |

Example workout-date response:

```json
{
  "date": "2026-09-01",
  "found": true,
  "workouts": [
    {
      "id": 12,
      "date": "2026-09-01",
      "workoutType": "PUSH",
      "status": "COMPLETED",
      "notes": null,
      "exercises": []
    }
  ]
}
```

Example no-analysis response:

```json
{
  "available": false,
  "analysis": null
}
```

### MCP Client Configuration

Use a Streamable HTTP client and point it to the backend endpoint. A common configuration shape is:

```json
{
  "mcpServers": {
    "body-dashboard": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:8080/mcp"
    }
  }
}
```

Client configuration field names vary; select HTTP or Streamable HTTP rather than the deprecated SSE transport.

### Security Limitations

- The MCP endpoint has no authentication or authorization.
- Keep it disabled unless needed and do not expose port 8080 beyond localhost or a trusted private boundary.
- The transport rejects non-loopback `Host` and `Origin` headers to reduce DNS-rebinding exposure.
- Any client that can reach `/mcp` can invoke every registered tool and read workout notes and stored analysis.
- MCP exposes no SQL, repository, shell, filesystem, environment, credential, or generic execution tools.
- Tool logs contain lifecycle and tool names only, not full arguments or responses.
- `get_latest_analysis` is read-only; only the existing REST generation operation can create an analysis.
