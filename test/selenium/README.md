# legio browser tests

Run `npm run test:e2e` from this repository. The command starts the React development server on port 4000, runs the Selenium suite, and stops the server. Chrome and ChromeDriver must be available; Selenium Manager can install the driver when network access is available.

The same command runs in the pull request browser job. It fails when the port is occupied or an assertion fails. Set `E2E_PORT` and `E2E_PUBLIC_PATH` when using a different local port or deployment path.

The runner enables `REACT_APP_E2E_MODE` only for the development server. This bypasses Keycloak initialization for deterministic smoke tests and cannot activate in a production build.

## Current coverage

- Home page content on `/Home`.
- Implementation Guide iframe on `/ImplementationGuide`.

Add app-specific user journeys with controlled FHIR responses as features change. Assert visible outcomes and errors, rather than only checking that a route exists.
