import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { absoluteSiteUrl } from "../lib/urls";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const GET: APIRoute = async ({ site }) => {
  const staticPaths = [
    "/",
    "/notices/",
    "/events/",
    "/notifications/",
    "/guide/",
    "/about/",
    "/privacy/",
  ];
  const notices = await getCollection("notices", ({ data }) => !data.draft);
  const events = await getCollection("events", ({ data }) => !data.draft);
  const paths = [
    ...staticPaths,
    ...notices.map((entry) => `/notices/${entry.id}/`),
    ...events.map((entry) => `/events/${entry.id}/`),
  ];

  const urls = paths
    .map(
      (path) =>
        `<url><loc>${escapeXml(absoluteSiteUrl(site, path))}</loc></url>`,
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
};
