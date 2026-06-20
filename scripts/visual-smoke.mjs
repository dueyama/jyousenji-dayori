import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:4321";
const screenshotDir =
  process.env.SCREENSHOT_DIR ?? "/private/tmp/jyousenji-dayori-screenshots";
const failures = [];

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(screenshotDir, "home-desktop.png"),
    fullPage: true,
  });
  await assertPageState(page, "desktop home");

  for (const width of [390, 375, 320]) {
    await page.setViewportSize({ width, height: width === 320 ? 700 : 844 });
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(screenshotDir, `home-mobile-${width}.png`),
      fullPage: true,
    });
    await assertPageState(page, `mobile home ${width}`);
    const bottomNavVisible = await page
      .locator(".bottom-nav")
      .evaluate((element) => {
        return getComputedStyle(element).display !== "none";
      });
    if (!bottomNavVisible) {
      failures.push(`mobile home ${width}: bottom nav is not visible`);
    }
  }

  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(`${baseUrl}/notifications/`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(screenshotDir, "notifications-mobile-320.png"),
    fullPage: true,
  });
  await assertPageState(page, "notifications mobile 320");

  const notificationState = await page.evaluate(() => ({
    status:
      document.querySelector("#notification-status")?.textContent?.trim() ?? "",
    disabled:
      document.querySelector("#notification-button") instanceof
      HTMLButtonElement
        ? document.querySelector("#notification-button").disabled
        : null,
    hasOneSignalScript: [...document.scripts].some((script) =>
      script.src.includes("onesignal"),
    ),
  }));
  if (!notificationState.status.includes("通知機能は準備中")) {
    failures.push(
      `notifications: unexpected status "${notificationState.status}"`,
    );
  }
  if (notificationState.disabled !== true) {
    failures.push(
      "notifications: button should be disabled when OneSignal App ID is unset",
    );
  }
  if (notificationState.hasOneSignalScript) {
    failures.push(
      "notifications: OneSignal SDK script should not load without App ID",
    );
  }

  const manifestResponse = await page.goto(`${baseUrl}/manifest.webmanifest`);
  if (manifestResponse?.status() !== 200) {
    failures.push(`manifest.webmanifest status ${manifestResponse?.status()}`);
  }
  const manifestBody = (await page.textContent("body")) ?? "";
  if (!manifestBody.includes("standalone")) {
    failures.push("manifest.webmanifest does not include standalone display");
  }

  const workerResponse = await page.goto(`${baseUrl}/OneSignalSDKWorker.js`);
  if (workerResponse?.status() !== 200) {
    failures.push(`OneSignalSDKWorker.js status ${workerResponse?.status()}`);
  }
  const workerBody = (await page.textContent("body")) ?? "";
  if (!workerBody.includes("web/v16/OneSignalSDK.sw.js")) {
    failures.push(
      "OneSignalSDKWorker.js does not reference Web SDK v16 worker",
    );
  }

  const updaterWorkerResponse = await page.goto(
    `${baseUrl}/OneSignalSDKUpdaterWorker.js`,
  );
  if (updaterWorkerResponse?.status() !== 200) {
    failures.push(
      `OneSignalSDKUpdaterWorker.js status ${updaterWorkerResponse?.status()}`,
    );
  }
  const updaterWorkerBody = (await page.textContent("body")) ?? "";
  if (!updaterWorkerBody.includes("web/v16/OneSignalSDK.sw.js")) {
    failures.push(
      "OneSignalSDKUpdaterWorker.js does not reference Web SDK v16 worker",
    );
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Visual smoke passed. Screenshots: ${screenshotDir}`);

async function assertPageState(page, label) {
  const state = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim() ?? "",
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    hasMain: Boolean(document.querySelector("main")),
    hasSkipLink: Boolean(document.querySelector(".skip-link")),
  }));

  if (!state.h1) {
    failures.push(`${label}: h1 is missing`);
  }
  if (state.overflow) {
    failures.push(`${label}: horizontal overflow`);
  }
  if (!state.hasMain) {
    failures.push(`${label}: main is missing`);
  }
  if (!state.hasSkipLink) {
    failures.push(`${label}: skip link is missing`);
  }
}
