import { Builder, By, until, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import path from "node:path";

const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const publicPath = process.env.E2E_PUBLIC_PATH ?? process.env.PUBLIC_URL ?? "";
const timeoutMs = Number(process.env.E2E_TIMEOUT_MS ?? 15000);
const headless = process.env.SELENIUM_HEADLESS !== "false";
const disableWebSecurity = process.env.SELENIUM_DISABLE_WEB_SECURITY === "true";
const chromeUserDataDir =
  process.env.SELENIUM_USER_DATA_DIR ?? path.resolve(".selenium", "chrome-profile");

type E2ETest = {
  name: string;
  run: (driver: WebDriver) => Promise<void>;
};

function stripSlash(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function buildUrl(path: string): string {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const relativeParts = [publicPath, path]
    .map(stripSlash)
    .filter((part) => !!part);

  return new URL(relativeParts.join("/"), normalizedBaseUrl).toString();
}

async function waitForApplication(driver: WebDriver): Promise<void> {
  await driver.wait(
    async () =>
      driver
        .executeScript("return document.readyState")
        .then((state) => state === "complete"),
    timeoutMs
  );
}

async function createDriver(): Promise<WebDriver> {
  const options = new chrome.Options();

  if (headless) {
    options.addArguments("--headless=new");
  }

  options.addArguments(
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--window-size=1440,1000"
  );

  if (disableWebSecurity) {
    options.addArguments(
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      `--user-data-dir=${chromeUserDataDir}`
    );
  }

  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

async function getDebugContext(driver: WebDriver): Promise<string> {
  const currentUrl = await driver.getCurrentUrl();
  const title = await driver.getTitle();
  const body = await driver.findElement(By.css("body"));
  const bodyText = await body.getText();

  return [`url=${currentUrl}`, `title=${title}`, `body=${bodyText.slice(0, 500)}`].join(
    "\n"
  );
}

async function assertRouteHasSelector(
  driver: WebDriver,
  path: string,
  selector: string
): Promise<void> {
  await driver.get(buildUrl(path));
  await waitForApplication(driver);

  try {
    await driver.wait(until.elementLocated(By.css(selector)), timeoutMs);
  } catch (error) {
    const debugContext = await getDebugContext(driver);
    throw new Error(
      `Expected route ${path} to contain selector ${selector}.\n${debugContext}`
    );
  }
}

const tests: E2ETest[] = [
  {
    name: "home page renders",
    run: async (driver) => {
      await assertRouteHasSelector(driver, "Home", ".home-image-icon");
    },
  },
  {
    name: "implementation guide route renders an iframe",
    run: async (driver) => {
      await assertRouteHasSelector(
        driver,
        "ImplementationGuide",
        "iframe.implementation-guide-page__frame"
      );
    },
  },
  {
    name: "editorial calendar route is reachable",
    run: async (driver) => {
      await assertRouteHasSelector(
        driver,
        "EditorialCalendar",
        ".editorial-calendar-page"
      );
    },
  },
];

async function run(): Promise<void> {
  const driver = await createDriver();
  const failures: string[] = [];

  try {
    for (const test of tests) {
      try {
        await test.run(driver);
        console.log(`OK ${test.name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${test.name}: ${message}`);
        console.error(`KO ${test.name}`);
        console.error(message);
      }
    }
  } finally {
    await driver.quit();
  }

  if (failures.length > 0) {
    throw new Error(`Selenium e2e failures:\n${failures.join("\n")}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
