# Agent instructions for legio

This repository is a React application. Keep public APIs and existing user journeys stable.

## Before changing code

- Read the affected component or service, its network calls, and nearby tests.
- Keep API, authentication, and browser effects behind testable boundaries when changing them.
- Use this repository's routes and selectors; do not copy tests from another application.

## Verification

- Run deterministic tests with `npm run test:ci`.
- Run lint with `npm run lint`.
- Build with `npm run build:app`.
- Run browser journeys with `npm run test:e2e` (Chrome and ChromeDriver required).
- For new behavior, test observable outcomes, a meaningful failure, and loading or empty states when present.
- Use controlled data and network responses. CI tests must not require a live FHIR or Keycloak server.
- Do not use `--passWithNoTests` or add tests that only check whether a component mounts.

## Test placement

- Keep unit and component tests near the code under `src/`.
- Keep Selenium journeys in `test/selenium/` and update `test:e2e:run` when paths change.
- Update tests and documentation in the same change as the behavior.
