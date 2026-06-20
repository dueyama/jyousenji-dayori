import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { siteConfig } from "../config/site";
import { sortByNewest } from "../lib/dates";
import { absoluteSiteUrl } from "../lib/urls";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async ({ site }) => {
  const notices = sortByNewest(
    await getCollection("notices", ({ data }) => !data.draft),
  );
  const items = notices
    .map((entry) => {
      const url = absoluteSiteUrl(site, `/notices/${entry.id}/`);
      return [
        "<item>",
        `<title>${escapeXml(entry.data.title)}</title>`,
        `<description>${escapeXml(entry.data.summary)}</description>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid>${escapeXml(url)}</guid>`,
        `<pubDate>${new Date(entry.data.publishedAt).toUTCString()}</pubDate>`,
        "</item>",
      ].join("");
    })
    .join("");

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0"><channel><title>${escapeXml(siteConfig.name)}</title>` +
    `<description>${escapeXml(siteConfig.description)}</description>` +
    `<link>${escapeXml(absoluteSiteUrl(site, "/"))}</link>${items}</channel></rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
