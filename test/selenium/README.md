# Legio Selenium e2e tests

This folder contains Selenium smoke tests for the Legio React application.

## Prerequisites

Install dependencies after pulling this branch:

```bash
npm install
```

If the Implementation Guide iframe must be tested with generated content, prepare it first:

```bash
npm run dev:ig
```

## Run

The default e2e command starts Legio on port `4000`, runs Selenium, then stops the server:

```bash
npm run test:e2e
```

This avoids conflicts with a regular `npm start` already running on port `3000`.

The e2e runner is implemented in `scripts/run-e2e.cjs` and does not require `start-server-and-test`.

## Configuration

Environment variables:

- `E2E_PORT`: application port started by the e2e runner. Default: `4000`.
- `E2E_BASE_URL`: application base URL. Default: `http://localhost:${E2E_PORT}`.
- `E2E_PUBLIC_PATH`: public path or basename when the application is served below a path.
- `E2E_TIMEOUT_MS`: Selenium timeout in milliseconds. Default: `15000`.
- `E2E_SERVER_TIMEOUT_MS`: server startup timeout in milliseconds. Default: `120000`.
- `SELENIUM_HEADLESS`: set to `false` to display the browser.
- `SELENIUM_DISABLE_WEB_SECURITY`: Chrome local CORS/web-security bypass. Default through `npm run test:e2e`: `true`.
- `SELENIUM_USER_DATA_DIR`: Chrome profile directory used when web security is disabled. Default: `.selenium/chrome-profile`.

Examples:

```bash
npm run test:e2e
```

```bash
SELENIUM_HEADLESS=false npm run test:e2e
```

```bash
SELENIUM_DISABLE_WEB_SECURITY=false npm run test:e2e
```

```bash
E2E_PORT=4001 npm run test:e2e
```

On Windows PowerShell:

```powershell
$env:SELENIUM_HEADLESS="false"; npm run test:e2e
```

## Security note

`SELENIUM_DISABLE_WEB_SECURITY=true` is only for local e2e testing against development services without proper CORS headers. It must not be used as a production browser configuration.

## Current coverage

The current suite is a minimal application smoke test:

- home page route renders visible content;
- Implementation Guide route renders the IG iframe;
- editorial calendar route is reachable.

Functional workflows such as filters, campaign detail, creation, update and deletion must be added as soon as a stable test dataset or mock FHIR server is available.
