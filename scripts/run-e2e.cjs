const { spawn } = require("node:child_process");
const http = require("node:http");
const net = require("node:net");

const port = process.env.E2E_PORT || "4000";
const publicPath = process.env.E2E_PUBLIC_PATH || process.env.PUBLIC_URL || "/legio";
const baseUrl = process.env.E2E_BASE_URL || `http://localhost:${port}`;
const timeoutMs = Number(process.env.E2E_SERVER_TIMEOUT_MS || 120000);

function start(command, args, env = {}) {
  return spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: process.platform === "win32",
    detached: process.platform !== "win32",
  });
}

function assertPortAvailable() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", () => reject(new Error(`E2E port ${port} is already in use`)));
    probe.listen(Number(port), () => probe.close(resolve));
  });
}

function waitForServer(url) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });
      request.on("error", (error) => {
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}: ${error.message}`));
        } else {
          setTimeout(check, 1000);
        }
      });
      request.setTimeout(1000, () => request.destroy());
    }
    check();
  });
}

function stopServer(server) {
  if (!server.pid) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/PID", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  }
}

async function main() {
  await assertPortAvailable();
  const server = start("npm", ["run", "start"], {
    BROWSER: "none",
    PORT: port,
    PUBLIC_URL: publicPath,
    REACT_APP_E2E_MODE: "true",
  });
  const shutdown = () => stopServer(server);
  process.once("SIGINT", () => { shutdown(); process.exit(130); });
  process.once("SIGTERM", () => { shutdown(); process.exit(143); });

  try {
    await waitForServer(baseUrl);
    const tests = start("npm", ["run", "test:e2e:run"], {
      E2E_BASE_URL: baseUrl,
      E2E_PUBLIC_PATH: publicPath,
      SELENIUM_DISABLE_WEB_SECURITY: process.env.SELENIUM_DISABLE_WEB_SECURITY || "false",
    });
    tests.once("error", (error) => {
      console.error(error);
      shutdown();
      process.exitCode = 1;
    });
    tests.once("exit", (code) => {
      shutdown();
      process.exitCode = code === 0 ? 0 : code || 1;
    });
  } catch (error) {
    console.error(error);
    shutdown();
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
