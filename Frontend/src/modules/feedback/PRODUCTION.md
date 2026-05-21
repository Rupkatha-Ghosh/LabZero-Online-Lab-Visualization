# LabZero Feedback Module Production Checklist

## Integration

- Mount feedback routes behind authenticated application navigation.
- Wrap lazy feedback pages with `FeedbackModuleBoundary`.
- Confirm `VITE_API_URL` points to the production API host.
- Confirm the backend mounts `feedbackRoutes` at `/api/feedback`.

## Security

- Replace the placeholder Express feedback `requireAuth` middleware with the production JWT/session verifier.
- Keep admin routes behind `requireAdmin`.
- Validate server-side section limits: minimum 3 and maximum 5 questions per section.
- Rate-limit public submission endpoints.

## Performance

- Use lazy exports for heavy pages:
  - `LazyAnalyticsDashboardPage`
  - `LazyFeedbackAdminPage`
  - `LazyFeedbackFormPage`
  - `LazyTextFeedbackAnalysisPage`
- Keep Recharts inside lazy-loaded analytics pages.
- Add database indexes for `formId`, status, classroom, course, and created dates.
- Cache analytics responses when forms are closed.

## Accessibility

- Ensure every route has a visible page title.
- Keep error and validation messages visible near controls.
- Preserve keyboard navigation for forms, modals, and tables.
- Test color contrast in light and dark modes.

## Deployment

- Run `npm run lint`.
- Run `npm run build`.
- Smoke test form creation, publishing, submission, analytics, and text analysis.
- Verify CSV export in supported browsers.
- Verify mobile, tablet, and desktop layouts.
