# Body Dashboard Frontend Implementation

## Objective

Implement the complete user-facing frontend for Body Dashboard using the existing backend APIs, domain model, deterministic analytics, and AI-analysis functionality already present in this repository.

This is an end-to-end frontend implementation task.

Do not only scaffold pages, create placeholders, or stop after building individual components.

The final result should be a cohesive, usable application that allows the user to view and manage their body, fitness, recovery, nutrition, and analysis data through the existing backend.

---

# Source of Truth

Before making changes, read:

1. `AGENTS.md`
2. `README.md`
3. `API.md`
4. `DATA_MODEL.md`
5. `ANALYTICS_AND_AI.md`
6. `AUDIT.md`
7. `OPERATIONS.md`

Use the existing backend implementation as the final authority when documentation and implementation disagree.

Do not invent API endpoints or domain fields that do not exist.

If an API capability required by the UI is genuinely missing, clearly identify the gap instead of silently mocking backend behavior.

---

# Core Principle

The frontend is a visualization and interaction layer over stored factual data.

Never fabricate measurements, workouts, nutrition entries, recovery information, analytics, or AI conclusions.

Clearly distinguish:

- recorded facts
- deterministic analytics
- AI interpretation
- recommendations

Missing data should appear as missing or unavailable rather than as zero unless zero is genuinely stored.

---

# Product Direction

Body Dashboard should feel like a personal health and training control panel rather than an administrative CRUD application.

The interface should prioritize:

1. current status
2. trends
3. actionable information
4. recent activity
5. historical detail
6. data entry and editing

Avoid exposing database structure directly to the user.

Prefer understandable domain language over implementation terminology.

---

# Application Structure

Implement a coherent application shell with navigation between the major areas.

At minimum, evaluate the existing backend capabilities and build the appropriate frontend areas for:

- Dashboard / Overview
- Measurements
- Workouts
- Daily logs / recovery
- Nutrition, if supported by the backend
- Analytics
- AI weekly analysis
- History / trends
- Settings or system information only where genuinely useful

Do not create empty navigation destinations.

If the backend does not support one of these domains, omit it rather than creating fake functionality.

---

# Dashboard

The main dashboard should answer:

> How am I doing right now?

Surface useful current information such as, where supported:

- latest body weight
- body-weight trend
- recent measurements
- recent training
- workout frequency
- current or recent activity
- sleep/recovery information
- energy or soreness indicators
- nutrition summaries
- deterministic analytics
- latest weekly AI analysis

Use cards selectively.

Do not turn every value into an isolated card.

Group related information together.

---

# Trends and Charts

Use charts where a chart communicates something meaningfully better than raw numbers.

Possible examples, depending on available data:

- body weight over time
- measurement trends
- training volume
- workout frequency
- steps/activity
- sleep duration
- calorie intake
- protein intake

Charts must:

- work with sparse datasets
- handle one-point datasets
- handle missing days correctly
- not visually imply values that do not exist
- use real dates
- remain readable on smaller displays

Do not interpolate missing health measurements unless the backend explicitly produces such data.

---

# Measurements

Provide an effective interface for viewing measurement history and recording/editing measurements supported by the backend.

Show:

- latest measurement
- date
- historical values
- change over useful periods when deterministically calculable

Never infer measurements.

---

# Workouts

Create a useful training history experience rather than merely displaying database rows.

Where supported, expose:

- workout date
- workout/session type
- exercises
- sets
- reps
- load
- notes
- completed/missed status if represented by the domain

Allow creation/editing only according to existing API capabilities.

Preserve historical accuracy.

---

# Daily / Recovery Logs

Where supported by the backend, display and manage factual daily information such as:

- sleep
- activity
- steps
- energy
- pain or soreness
- recovery notes

Do not infer an unreported value as zero or normal.

Make missing values visually distinguishable from reported values.

---

# Analytics

Use the deterministic analytics produced by the backend.

Do not recreate business analytics independently in frontend JavaScript unless the API contract explicitly expects the frontend to do so.

The frontend may format and visualize analytics but should not produce competing calculations.

Where helpful, communicate:

- current trend
- comparison period
- relevant supporting facts

---

# Weekly AI Analysis

Integrate the existing weekly AI analysis API.

The UI should clearly separate the analysis into the structured sections returned by the backend, such as:

- Summary
- Strengths
- Concerns
- Recommendations

AI-generated interpretation must be visually recognizable as analysis rather than measured fact.

Do not imply that AI recommendations are stored measurements or deterministic analytics.

Handle insufficient-data responses gracefully.

Do not manufacture an analysis client-side when the backend reports insufficient data.

---

# Loading, Empty, and Error States

Every major data-driven screen must handle:

- initial loading
- no data
- partial data
- API errors
- unsuccessful mutations

Avoid blank screens.

Empty states should explain what information is missing and, where appropriate, provide a path to add it.

Errors should be understandable without exposing unnecessary implementation details.

---

# Responsive Design

The application must be usable on:

- desktop
- laptop
- tablet
- mobile

Desktop may provide richer dashboard layouts.

Mobile should preserve access to the same important information without simply shrinking desktop grids.

---

# Visual Direction

Use a modern, restrained dashboard aesthetic.

Prioritize:

- readable typography
- strong hierarchy
- generous but efficient spacing
- consistent surfaces
- clear status indicators
- high information density without clutter
- coherent chart styling
- predictable interactions

Avoid:

- excessive gradients
- excessive glassmorphism
- huge hero sections
- decorative animations
- excessive card nesting
- random colors for unrelated metrics
- generic SaaS landing-page styling

This is an application, not a marketing website.

---

# Components

Create reusable components where repetition genuinely exists.

Examples may include:

- application shell
- navigation
- page headers
- metric groups
- chart containers
- empty states
- error states
- loading states
- forms
- dialogs
- date selectors
- analysis sections

Do not prematurely abstract one-off components.

Prefer readable composition over excessive component indirection.

---

# API Integration

Centralize API interaction appropriately.

Do not scatter arbitrary `fetch()` calls throughout presentation components.

Reuse the project's existing networking conventions if they exist.

Maintain proper separation between:

- transport/API logic
- domain data
- presentation

Handle backend errors consistently.

Do not silently swallow errors.

---

# Data Integrity

This requirement is critical.

The frontend must not:

- invent missing measurements
- substitute missing values with zero
- fabricate analytics
- generate fake workout history
- create fake AI results
- silently fill incomplete records
- infer medical conclusions

When information is unavailable, explicitly represent it as unavailable.

---

# Authentication

Do not implement authentication unless authentication already exists and is required by the current backend.

This application is intended for private/personal deployment.

Do not introduce an authentication system as part of this frontend task.

---

# Existing Code

Inspect the current frontend before replacing anything.

Preserve useful existing implementation.

Refactor where necessary, but do not rewrite functioning infrastructure merely for stylistic preference.

Follow the technologies and conventions already selected by the repository unless there is a strong technical reason not to.

Do not introduce a new frontend framework.

---

# Dependencies

Prefer existing dependencies.

Add a dependency only when it provides meaningful value and cannot reasonably be implemented with the existing stack.

Avoid large dependencies for trivial functionality.

Do not replace established project libraries without necessity.

---

# Accessibility

Use semantic HTML and accessible interaction patterns.

Ensure:

- buttons are buttons
- labels are associated with inputs
- keyboard navigation works for important interactions
- dialogs can be operated predictably
- important information is not communicated exclusively through color

---

# Implementation Process

Work through the frontend systematically.

First inspect:

- frontend architecture
- routes
- existing components
- styling system
- API client
- backend endpoint contracts
- domain models

Then establish the application shell and shared primitives.

Then implement the primary user flows.

Then connect analytics and AI functionality.

Then complete loading/error/empty states.

Then perform responsive and consistency passes.

Do not stop after producing a plan.

Continue directly into implementation.

---

# Diagnostics

After modifying source code, use the available project diagnostics and pi-lens capabilities where appropriate.

Inspect affected files and related modules.

Resolve diagnostics introduced by the implementation.

Do not automatically suppress findings.

Do not mark findings as false positives without a concrete technical reason.

Run the project's appropriate:

- formatter
- linter
- type checker
- tests
- production build

Fix failures caused by the implementation.

---

# Definition of Done

The task is complete when:

- the frontend builds successfully
- primary routes work
- existing backend APIs are actually integrated
- main user flows are usable
- data-entry flows supported by the backend work
- dashboard information uses real backend data
- deterministic analytics are surfaced correctly
- weekly AI analysis is integrated
- missing data is never fabricated
- loading states exist
- empty states exist
- API failures are handled
- the UI is responsive
- obvious dead code and placeholder content are removed
- new diagnostics introduced by the work are resolved
- relevant documentation is updated if implementation behavior changed

Do not declare completion merely because all pages have been created.

Verify the application as a working whole.

---

# Final Report

When implementation is complete, provide a concise report containing:

## Implemented

Major features completed.

## Architecture

Important frontend structure or patterns introduced.

## API Coverage

Backend APIs integrated.

## Validation

Commands/tests/builds run and their outcomes.

## Remaining Gaps

Only genuine remaining limitations, backend gaps, or deferred work.

Do not describe planned work as completed.