import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

const readSource = (file) =>
  readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("Q&A starts with the homyo and ingo guide and links to separate answers", async () => {
  const faq = await readSource("src/pages/faq.astro");
  const targets = [...faq.matchAll(/href: "([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(targets, [
    "/homyo-ingo/",
    "/faq/buddhist-practices/",
    "/faq/sutra-books/",
    "/notifications/",
  ]);
  assert.match(faq, /withBasePath\(question\.href\)/);
  assert.match(faq, /canonicalPath="\/faq\/"/);
  assert.match(faq, /<h1>よくあるご質問<\/h1>/);
  assert.match(await readSource("src/pages/sitemap.xml.ts"), /"\/faq\/"/);
});

test("temple practices and sutra book answers preserve the official source content", async () => {
  const practices = await readSource("src/pages/faq/buddhist-practices.astro");
  const books = await readSource("src/pages/faq/sutra-books.astro");
  const layout = await readSource("src/layouts/FaqAnswerLayout.astro");
  const sitemap = await readSource("src/pages/sitemap.xml.ts");

  for (const id of ["NJUDWiP8-og", "CuHzf7442Ek", "rpBI1n71d50"]) {
    assert.ok(practices.includes(`https://www.youtube.com/watch?v=${id}`));
  }
  assert.match(practices, /https:\/\/www\.hongwanji\.or\.jp\/faq\//);
  assert.doesNotMatch(practices, /<iframe|youtube\.com\/embed|autoplay/);
  for (const phrase of [
    "日常勤行聖典",
    "本願寺出版社",
    "お取越し",
    "お盆",
    "法座にもお持ちください",
    "仏事勤行聖典",
    "百華苑",
    "満中陰",
    "一周忌",
    "三回忌",
    "一定数をお持ちしています",
  ]) {
    assert.ok(books.includes(phrase), phrase);
  }
  for (const source of [practices, books]) {
    assert.match(
      source,
      /https:\/\/sites\.google\.com\/view\/hitomarujyousenji\/about\/faq/,
    );
    assert.match(source, /rel="noopener noreferrer"/);
  }
  assert.doesNotMatch(books, /item\/detail\.html\?icd=|b536485\.html/);
  assert.match(books, /import \{ Image \} from "astro:assets"/);
  assert.equal((books.match(/<Image\s/g) || []).length, 2);
  assert.match(layout, /withBasePath\("\/faq\/"\)/);
  for (const route of ["/faq/buddhist-practices/", "/faq/sutra-books/"]) {
    assert.ok(sitemap.includes(`"${route}"`));
  }
});

test("sutra book covers are small local images without private metadata", async () => {
  for (const name of ["nichijo-gongyo-seiten", "butsuji-gongyo-seiten"]) {
    const path = new URL(
      `../src/assets/faq/${name}-transparent.webp`,
      import.meta.url,
    );
    const image = await sharp(await readFile(path)).metadata();
    assert.ok(image.width > 0 && image.width <= 600);
    assert.ok(image.height > 0 && image.height <= 600);
    assert.equal(image.exif, undefined);
    assert.equal(image.xmp, undefined);
    assert.equal(image.iptc, undefined);
    assert.equal(image.hasAlpha, true);
    const { data, info } = await sharp(await readFile(path))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (const [x, y] of [
      [0, 0],
      [info.width - 1, 0],
      [0, info.height - 1],
      [info.width - 1, info.height - 1],
    ]) {
      assert.ok(
        data[(y * info.width + x) * 4 + 3] <= 1,
        `${name}: transparent corner`,
      );
    }
  }
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
