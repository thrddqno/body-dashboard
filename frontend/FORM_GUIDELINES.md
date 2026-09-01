# Form Guidelines

Forms collect and map input. Domain rules and authoritative validation remain in the backend.

## Ownership

- Pages own API loading, submission state, success feedback, and backend errors.
- Forms own transient input values unless a page must synchronize them with fetched route data.
- Keep numeric input values as strings while editing, then convert them at submission.
- Keep request mapping close to the feature rather than putting business rules in shared UI components.

## Validation and Errors

- Use native HTML attributes for simple required, range, and input-type constraints.
- Treat backend validation as authoritative and display its field errors beside the relevant control.
- Give each control a stable `id`. Connect its error with `aria-invalid` and `aria-describedby`.
- Render field errors with `FieldError` and form-level failures in a `role="alert"` region.
- Normalize text intentionally at submission; blank optional text becomes `null`.

## Styling

- Use `.form-control`, `.form-label`, `.form-label-text`, `.form-help`, `.form-error`, and `.form-checkbox` for repeated form styling. Pair `.form-control-compact` with `.form-control` only when a dense editor needs smaller controls.
- Use Tailwind utilities for feature-specific spacing, grids, responsive layout, and column spans.
- Use `.button-primary` and `.button-secondary` for actions.
- Preserve the design tokens in `src/index.css`; do not add feature-specific color systems.

## Submission

- Clear stale errors and success feedback before a new request.
- Disable fields and mutation controls while submitting to prevent conflicting edits or duplicate requests.
- Preserve each feature's explicit success behavior: reset, replace with the server response, close editing, or navigate.

## Form Libraries

Controlled React state is the default while forms remain small and validation is mostly native or server-side. Reconsider React Hook Form when several more forms, reusable client schemas, substantial cross-field validation, or more complex nested editing make the added dependency worthwhile.
