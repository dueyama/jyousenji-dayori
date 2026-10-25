import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (file) =>
  readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("Q&A starts with the homyo and ingo guide and links to separate answers", async () => {
  const faq = await readSource("src/pages/faq.astro");
  const targets = [...faq.matchAll(/href: "([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(targets, ["/homyo-ingo/", "/notifications/"]);
  assert.match(faq, /withBasePath\(question\.href\)/);
  assert.match(faq, /canonicalPath="\/faq\/"/);
  assert.match(faq, /<h1>よくあるご質問<\/h1>/);
  assert.match(await readSource("src/pages/sitemap.xml.ts"), /"\/faq\/"/);
});

test("desktop and mobile menus share Q&A instead of duplicate setup destinations", async () => {
  const header = await readSource("src/components/SiteHeader.astro");
  const targets = [...header.matchAll(/href: "([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(targets.slice(0, 4), [
    "/",
    "/notices/",
    "/events/",
    "/faq/",
  ]);
  assert.ok(!targets.includes("/guide/"));
  assert.ok(!targets.includes("/notifications/"));
  assert.match(header, /navItems\.slice\(0, 4\)/);
  assert.match(
    await readSource("src/components/SiteFooter.astro"),
    /withBasePath\("\/faq\/"\)/,
  );
});

test("installation instructions stay on the stable guide URL and registration stays separate", async () => {
  const guide = await readSource("src/pages/guide.astro");
  const notifications = await readSource("src/pages/notifications.astro");
  assert.match(guide, /canonicalPath="\/guide\/"/);
  assert.match(guide, /id="iphone"/);
  assert.match(guide, /id="android"/);
  assert.match(guide, /withBasePath\("\/notifications\/"\)/);
  assert.match(notifications, /withBasePath\("\/guide\/"\)/);
  assert.match(notifications, /withBasePath\("\/faq\/"\)/);
  assert.match(notifications, /id="notification-status"/);
  assert.match(notifications, /id="notification-button"/);
  assert.doesNotMatch(notifications, /<ol>|id="ios-title"|id="android-title"/);
  assert.match(
    notifications,
    /button\?\.addEventListener\("click", async \(\) =>/,
  );
});
