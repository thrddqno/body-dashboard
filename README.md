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
