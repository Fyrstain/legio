const { spawn } = require("node:child_process");
const http = require("node:http");

const port = process.env.E2E_PORT || "4000";
const publicPath = process.env.E2E_PUBLIC_PATH || process.env.PUBLIC_URL || "/Legio";
const baseUrl = process.env.E2E_BASE_URL || `http://localhost:${port}`;
const timeoutMs = Number(process.env.E2E_SERVER_TIMEOUT_MS || 120000);

function waitForServer(url, timeout) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeout) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }

        setTimeout(check, 1000);
      });

      request.setTimeout(1000, () => {
        request.destroy();
      });
    };

    check();
  });
}

function run(command, args, env) {
  return spawn(command, args, {
    env: { ...process.env, ...env },
    shell: true,
    stdio: "inherit",
  });
}

async function main() {
  const server = run("npx", ["react-app-rewired", "start"], {
    BROWSER: "none",
    PORT: port,
    PUBLIC_URL: publicPath,
    REACT_APP_E2E_MODE: "true",
  });

  const stopServer = () => {
    if (!server.killed) {
      server.kill();
    }
  };

  process.on("SIGINT", () => {
    stopServer();
    process.exit(130);
  });

  process.on("SIGTERM", () => {
    stopServer();
    process.exit(143);
  });

  try {
    await waitForServer(baseUrl, timeoutMs);

    const test = run("npx", ["tsx", "test/selenium/legio.e2e.ts"], {
      E2E_BASE_URL: baseUrl,
      E2E_PUBLIC_PATH: publicPath,
      SELENIUM_DISABLE_WEB_SECURITY:
        process.env.SELENIUM_DISABLE_WEB_SECURITY || "true",
    });

    test.on("exit", (code) => {
      stopServer();
      process.exit(code || 0);
    });
  } catch (error) {
    console.error(error);
    stopServer();
    process.exit(1);
  }
}

main();
