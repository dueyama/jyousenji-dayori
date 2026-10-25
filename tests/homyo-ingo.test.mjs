import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routePath = new URL(
  "../src/pages/homyo-ingo/index.astro",
  import.meta.url,
);

test("homyo and ingo guide is a public static page with an entry link", async () => {
  const route = await readFile(routePath, "utf8");
  assert.doesNotMatch(
    route,
    /import\.meta\.env\.DEV|getStaticPaths|noindex|下書き・確認用/,
  );
  assert.match(route, /canonicalPath="\/homyo-ingo\/"/);

  const about = await readFile(
    new URL("../src/pages/about.astro", import.meta.url),
    "utf8",
  );
  assert.match(about, /withBasePath\("\/faq\/"\)/);
  const faq = await readFile(
    new URL("../src/pages/faq.astro", import.meta.url),
    "utf8",
  );
  assert.match(faq, /href: "\/homyo-ingo\/"/);
  assert.doesNotMatch(
    about,
    /import\.meta\.env\.DEV|法名・院号のご案内（下書き）/,
  );
  const sitemap = await readFile(
    new URL("../src/pages/sitemap.xml.ts", import.meta.url),
    "utf8",
  );
  assert.match(sitemap, /"\/homyo-ingo\/"/);
});

test("guide preserves the approved ceremony and application distinctions", async () => {
  const route = await readFile(routePath, "utf8");
  assert.match(
    route,
    /帰敬式は、生涯に一度の儀式です。すでに受けられた方は、改めて受ける必要はありません。/,
  );
  assert.match(route, /ほぼ毎日、朝と昼/);
  assert.match(route, /開催日や回数は別院・年度によって異なります/);
  assert.match(route, /まず浄泉寺へご相談ください/);
  assert.match(route, /2か月前までに所属寺院の住職から申請/);
  assert.doesNotMatch(
    route,
    /すでに法名をいただいている方は、そのこともお伝えください/,
  );
  assert.match(route, /成人12,000円、未成年6,000円/);
  assert.match(route, /成人15,000円、未成年9,000円/);
  assert.match(route, /この年の案内上の申込締切は過ぎています/);
  assert.match(route, /2026年11月25日（水）/);
  assert.match(route, /永代経懇志20万円以上/);
  assert.match(route, /寺院が独自に院号を授けるものではありません/);
});

test("guide navigation uses valid sections and official sources", async () => {
  const route = await readFile(routePath, "utf8");
  const ids = [
    "homyo",
    "places",
    "application",
    "offering",
    "yamaguchi",
    "ingo",
    "bereavement",
  ];
  for (const id of ids) {
    assert.ok(route.includes(`["${id}",`));
    assert.ok(
      route.includes(`<section id="${id}" aria-labelledby="${id}-title">`),
    );
    assert.ok(route.includes(`<h2 id="${id}-title">`));
  }
  assert.match(route, /withBasePath\("\/faq\/"\)/);
  assert.match(route, /www\.hongwanji\.kyoto\/visit\/application\.html/);
  assert.match(route, /www\.yamaguchibetsuin\.net/);
  for (const link of route.matchAll(/<a\s+href=\{sources\.[^>]+>/g)) {
    assert.match(link[0], /rel="noopener noreferrer"/);
  }
});
