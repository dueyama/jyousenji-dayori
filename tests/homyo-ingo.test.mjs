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

test("ceremony sources deep-link to the official section and include both official videos", async () => {
  const route = await readFile(routePath, "utf8");
  assert.match(
    route,
    /ceremony: "https:\/\/www\.hongwanji\.kyoto\/visit\/application\.html#d03_03"/,
  );
  for (const id of ["homyo", "places", "application", "offering"]) {
    const section = route.match(
      new RegExp(`<section id="${id}"[^>]*>([\\s\\S]*?)<\\/section>`),
    )?.[1];
    assert.ok(section, `Missing section: ${id}`);
    assert.match(section, /href=\{sources\.ceremony\}/);
    assert.doesNotMatch(section, /href=\{sources\.application\}/);
  }
  const ingo = route.match(
    /<section id="ingo"[^>]*>([\s\S]*?)<\/section>/,
  )?.[1];
  assert.match(ingo, /href=\{sources\.application\}/);
  assert.doesNotMatch(ingo, /href=\{sources\.ceremony\}/);

  for (const [key, videoId] of [
    ["ceremonyIntroduction", "Rk-2H6Mwv5I"],
    ["ceremonyApplication", "bXkBHOa7Fo0"],
  ]) {
    assert.ok(
      route.includes(`${key}: "https://www.youtube.com/watch?v=${videoId}"`),
    );
    assert.match(
      route,
      new RegExp(
        `<a\\s+href=\\{sources\\.${key}\\}\\s+rel="noopener noreferrer"\\s+target="_blank"`,
      ),
    );
  }
  assert.match(route, /西本願寺の公式動画（YouTube）/);
  assert.match(route, /法名の意味と帰敬式の様子（Vol\.1）/);
  assert.match(route, /記念品と申込みの案内（Vol\.2）/);
  assert.doesNotMatch(route, /<iframe|youtube\.com\/embed|youtube-nocookie/);
});
